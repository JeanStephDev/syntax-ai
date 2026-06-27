export default function Loading() {
  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20 }}>
      <div style={{ width:40, height:40, borderRadius:10, background:'linear-gradient(135deg,#6B4EFF,#3B82F6)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <svg width={20} height={20} viewBox="0 0 24 24" fill="white">
          <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.4l7.5 3.75v7.5L12 19.4l-7.5-3.75v-7.5L12 4.4z"/>
        </svg>
      </div>
      <div style={{ width:28, height:28, border:'3px solid rgba(107,78,255,0.2)', borderTopColor:'#6B4EFF', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
