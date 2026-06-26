import { LogoMark } from '@/components/layout'

export default function Loading() {
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20 }}>
      <LogoMark size={48} />
      <div style={{ width:32, height:32, border:'3px solid var(--border)', borderTopColor:'var(--v)', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
