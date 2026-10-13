/* rs.c — raymarcher a volumi (SDF) per fare la base solida delle creature.
   Legge un modello di testo (gruppi + pezzi), una telecamera ortografica, e scrive per ogni pixel:
   colpito, profondità, punto, normale, pezzo più vicino. Il colore lo decide Python. */
#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <string.h>

typedef struct { float x,y,z; } v3;
static inline v3 V3(float x,float y,float z){v3 r={x,y,z};return r;}
static inline v3 add(v3 a,v3 b){return V3(a.x+b.x,a.y+b.y,a.z+b.z);}
static inline v3 sub(v3 a,v3 b){return V3(a.x-b.x,a.y-b.y,a.z-b.z);}
static inline v3 mul(v3 a,float s){return V3(a.x*s,a.y*s,a.z*s);}
static inline float dot(v3 a,v3 b){return a.x*b.x+a.y*b.y+a.z*b.z;}
static inline float len3(v3 a){return sqrtf(dot(a,a));}
static inline float clampf(float x,float a,float b){return x<a?a:(x>b?b:x);}
static inline float signf(float x){return x<0?-1.f:1.f;}

enum {ELL=0, RCONE=1, SLAB=2, INFL=3};
typedef struct {
  int type, group, part;
  v3 c; float R[9];          /* origine e righe della rotazione mondo->locale */
  float p[8];                /* ELL: rx ry rz | RCONE: ax ay az bx by bz ra rb | SLAB: t0 taper rr cup */
  int tri0, ntri;
  v3 bc; float br;           /* sfera che contiene il pezzo (allargata del raccordo) */
} Prim;

static int NG, NP, NT;
static float GK[64];
static Prim *P;
static float *TRI;           /* 6 float per triangolo */
static int NGR; static float *GR;   /* griglie delle forme gonfiate */

static inline float smin(float a,float b,float k){
  if(k<=0) return a<b?a:b;
  float h=fmaxf(k-fabsf(a-b),0.f)/k; return fminf(a,b)-h*h*k*0.25f;
}
static inline v3 loc(const Prim*q,v3 p){
  v3 d=sub(p,q->c); const float*R=q->R;
  return V3(R[0]*d.x+R[1]*d.y+R[2]*d.z, R[3]*d.x+R[4]*d.y+R[5]*d.z, R[6]*d.x+R[7]*d.y+R[8]*d.z);
}
static float sdTri(float px,float py,const float*t){
  float p0x=t[0],p0y=t[1],p1x=t[2],p1y=t[3],p2x=t[4],p2y=t[5];
  float e0x=p1x-p0x,e0y=p1y-p0y,e1x=p2x-p1x,e1y=p2y-p1y,e2x=p0x-p2x,e2y=p0y-p2y;
  float v0x=px-p0x,v0y=py-p0y,v1x=px-p1x,v1y=py-p1y,v2x=px-p2x,v2y=py-p2y;
  float h0=clampf((v0x*e0x+v0y*e0y)/(e0x*e0x+e0y*e0y),0,1);
  float h1=clampf((v1x*e1x+v1y*e1y)/(e1x*e1x+e1y*e1y),0,1);
  float h2=clampf((v2x*e2x+v2y*e2y)/(e2x*e2x+e2y*e2y),0,1);
  float q0x=v0x-e0x*h0,q0y=v0y-e0y*h0,q1x=v1x-e1x*h1,q1y=v1y-e1y*h1,q2x=v2x-e2x*h2,q2y=v2y-e2y*h2;
  float s=signf(e0x*e2y-e0y*e2x);
  float dx=q0x*q0x+q0y*q0y, dy=s*(v0x*e0y-v0y*e0x);
  float ax=q1x*q1x+q1y*q1y, ay=s*(v1x*e1y-v1y*e1x);
  float bx=q2x*q2x+q2y*q2y, by=s*(v2x*e2y-v2y*e2x);
  if(ax<dx)dx=ax; if(bx<dx)dx=bx; if(ay<dy)dy=ay; if(by<dy)dy=by;
  return -sqrtf(dx)*signf(dy);
}
static float sdPrim(const Prim*q,v3 p){
  if(q->type==ELL){
    v3 l=loc(q,p); float rx=q->p[0],ry=q->p[1],rz=q->p[2];
    float k0=sqrtf((l.x/rx)*(l.x/rx)+(l.y/ry)*(l.y/ry)+(l.z/rz)*(l.z/rz));
    float k1=sqrtf((l.x/(rx*rx))*(l.x/(rx*rx))+(l.y/(ry*ry))*(l.y/(ry*ry))+(l.z/(rz*rz))*(l.z/(rz*rz)));
    if(k1<1e-6f) return -fminf(rx,fminf(ry,rz));
    return k0*(k0-1.f)/k1;
  }
  if(q->type==RCONE){
    v3 a=V3(q->p[0],q->p[1],q->p[2]), b=V3(q->p[3],q->p[4],q->p[5]); float r1=q->p[6], r2=q->p[7];
    v3 ba=sub(b,a); float l2=dot(ba,ba), rr=r1-r2, a2=l2-rr*rr, il2=1.f/l2;
    v3 pa=sub(p,a); float y=dot(pa,ba), z=y-l2;
    v3 w=sub(mul(pa,l2),mul(ba,y)); float x2=dot(w,w), y2=y*y*l2, z2=z*z*l2;
    float k=signf(rr)*rr*rr*x2;
    if(signf(z)*a2*z2>k) return sqrtf(x2+z2)*il2-r2;
    if(signf(y)*a2*y2<k) return sqrtf(x2+y2)*il2-r1;
    return (sqrtf(x2*a2*il2)+y*rr)*il2-r1;
  }
  if(q->type==INFL){
    v3 l=loc(q,p); int nu=(int)q->p[0], nv=(int)q->p[1]; float u0=q->p[2], v0=q->p[3], cs=q->p[4]; int off=(int)q->p[5];
    float fu=(l.x-u0)/cs, fv=(l.y-v0)/cs;
    float bu=fmaxf(fmaxf(-fu,fu-(nu-1)),0.f)*cs, bv=fmaxf(fmaxf(-fv,fv-(nv-1)),0.f)*cs;
    if(bu>0||bv>0){ float e=sqrtf(bu*bu+bv*bv); return e+cs; }
    int iu=(int)fu, iv=(int)fv; if(iu>nu-2)iu=nu-2; if(iv>nv-2)iv=nv-2; if(iu<0)iu=0; if(iv<0)iv=0;
    float tu=fu-iu, tv=fv-iv;
    const float*D=GR+off, *Hh=GR+off+nu*nv;
    #define G(A,i,j) A[(j)*nu+(i)]
    float d2=(G(D,iu,iv)*(1-tu)+G(D,iu+1,iv)*tu)*(1-tv)+(G(D,iu,iv+1)*(1-tu)+G(D,iu+1,iv+1)*tu)*tv;
    float hh=(G(Hh,iu,iv)*(1-tu)+G(Hh,iu+1,iv)*tu)*(1-tv)+(G(Hh,iu,iv+1)*(1-tu)+G(Hh,iu+1,iv+1)*tu)*tv;
    #undef G
    float dw=fabsf(l.z)-hh;
    float o=fminf(fmaxf(d2,dw),0.f)+sqrtf(fmaxf(d2,0.f)*fmaxf(d2,0.f)+fmaxf(dw,0.f)*fmaxf(dw,0.f));
    return o*q->p[6];
  }
  /* SLAB: profilo 2D (unione di triangoli) in (u,v), spessore lungo w, piegato a coppa */
  v3 l=loc(q,p); float t0=q->p[0], tk=q->p[1], rr=q->p[2], cup=q->p[3];
  float d2=1e9f; for(int i=0;i<q->ntri;i++){ float d=sdTri(l.x,l.y,TRI+6*(q->tri0+i)); if(d<d2)d2=d; }
  float th=fmaxf(t0-tk*l.x,0.15f*t0);
  float w=l.z-cup*l.y*l.y;
  float dw=fabsf(w)-th;
  float o=fminf(fmaxf(d2,dw),0.f)+sqrtf(fmaxf(d2,0.f)*fmaxf(d2,0.f)+fmaxf(dw,0.f)*fmaxf(dw,0.f))-rr;
  return o*0.85f;
}
/* campo con i soli pezzi candidati */
static float sdf(v3 p,const int*cand,int nc,int*best){
  float gd[64]; unsigned long long used=0; float bd=1e9f; int bi=-1;
  for(int i=0;i<nc;i++){
    const Prim*q=&P[cand[i]]; float d=sdPrim(q,p); int g=q->group;
    if(!(used>>g&1ULL)){gd[g]=d; used|=1ULL<<g;} else gd[g]=smin(gd[g],d,GK[g]);
    if(best && d<bd){bd=d;bi=cand[i];}
  }
  float d=1e9f; for(int g=0;g<NG;g++) if(used>>g&1ULL) if(gd[g]<d) d=gd[g];
  if(best) *best=bi;
  return d;
}

int main(int argc,char**argv){
  if(argc<4){fprintf(stderr,"uso: rs modello.txt cam.txt uscita.bin\n");return 1;}
  FILE*f=fopen(argv[1],"r"); if(!f){perror("modello");return 1;}
  if(fscanf(f,"%d",&NG)!=1) return 1;
  for(int g=0;g<NG;g++) fscanf(f,"%f",&GK[g]);
  fscanf(f,"%d %d",&NP,&NT);
  P=calloc(NP,sizeof(Prim)); TRI=calloc(NT*6+6,sizeof(float));
  for(int i=0;i<NP;i++){
    Prim*q=&P[i];
    fscanf(f,"%d %d %d",&q->type,&q->group,&q->part);
    fscanf(f,"%f %f %f",&q->c.x,&q->c.y,&q->c.z);
    for(int k=0;k<9;k++) fscanf(f,"%f",&q->R[k]);
    for(int k=0;k<8;k++) fscanf(f,"%f",&q->p[k]);
    fscanf(f,"%d %d",&q->tri0,&q->ntri);
    fscanf(f,"%f %f %f %f",&q->bc.x,&q->bc.y,&q->bc.z,&q->br);
  }
  for(int i=0;i<NT*6;i++) fscanf(f,"%f",&TRI[i]);
  NGR=0; if(fscanf(f,"%d",&NGR)==1 && NGR>0){ GR=calloc(NGR,sizeof(float)); for(int i=0;i<NGR;i++) fscanf(f,"%f",&GR[i]); }
  fclose(f);
  /* telecamera: W H scala(unità per pixel) centro(3) c(3) r(3) u(3) */
  int W,H; float s; v3 ctr,c,r,u;
  f=fopen(argv[2],"r"); if(!f){perror("cam");return 1;}
  fscanf(f,"%d %d %f",&W,&H,&s);
  fscanf(f,"%f %f %f %f %f %f %f %f %f %f %f %f",&ctr.x,&ctr.y,&ctr.z,&c.x,&c.y,&c.z,&r.x,&r.y,&r.z,&u.x,&u.y,&u.z);
  fclose(f);
  float *out=calloc((size_t)W*H*9,sizeof(float));
  const float D=1000.f; v3 dir=mul(c,-1.f);
  #pragma omp parallel for schedule(dynamic,4)
  for(int j=0;j<H;j++){
    int cand[1024];
    for(int i=0;i<W;i++){
      float sx=(i+0.5f-W*0.5f)*s, sy=(H*0.5f-j-0.5f)*s;
      v3 o=add(add(ctr,add(mul(r,sx),mul(u,sy))),mul(c,D));
      int nc=0; float tmin=1e9f,tmax=-1e9f;
      for(int k=0;k<NP;k++){
        v3 oc=sub(P[k].bc,o); float tc=dot(oc,dir); v3 pr=sub(oc,mul(dir,tc)); float d2=dot(pr,pr), br2=P[k].br*P[k].br;
        if(d2<br2){ float h=sqrtf(br2-d2); if(tc-h<tmin)tmin=tc-h; if(tc+h>tmax)tmax=tc+h; if(nc<1024) cand[nc++]=k; }
      }
      float*px=out+((size_t)j*W+i)*9;
      if(!nc){px[0]=0;continue;}
      float t=tmin>0?tmin:0; int hit=0;
      for(int it=0;it<400 && t<tmax;it++){
        v3 p=add(o,mul(dir,t)); float d=sdf(p,cand,nc,0);
        if(d<0.004f){hit=1;break;}
        t+=fmaxf(d*0.9f,0.002f);
      }
      if(!hit){px[0]=0;continue;}
      v3 p=add(o,mul(dir,t)); int bi; sdf(p,cand,nc,&bi);
      const float e=0.01f;
      float nx=sdf(add(p,V3(e,0,0)),cand,nc,0)-sdf(sub(p,V3(e,0,0)),cand,nc,0);
      float ny=sdf(add(p,V3(0,e,0)),cand,nc,0)-sdf(sub(p,V3(0,e,0)),cand,nc,0);
      float nz=sdf(add(p,V3(0,0,e)),cand,nc,0)-sdf(sub(p,V3(0,0,e)),cand,nc,0);
      float nl=sqrtf(nx*nx+ny*ny+nz*nz)+1e-12f;
      px[0]=1; px[1]=D-t; px[2]=p.x; px[3]=p.y; px[4]=p.z; px[5]=nx/nl; px[6]=ny/nl; px[7]=nz/nl; px[8]=(float)bi;
    }
  }
  f=fopen(argv[3],"wb"); fwrite(out,sizeof(float),(size_t)W*H*9,f); fclose(f);
  return 0;
}
