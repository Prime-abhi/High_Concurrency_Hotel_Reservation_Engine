export default function Hero({ hotel }) {
  const photo = `https://picsum.photos/seed/${(hotel?.name || 'meridian').replace(/\s+/g, '-')}-hero/1200/500`

  return (
    <div className="relative rounded-2xl overflow-hidden h-64 mb-7">
      <img src={photo} alt={hotel?.name || 'Hotel'} className="w-full h-full object-cover" />
      <div className="absolute inset-0 flex flex-col justify-end p-6"
        style={{ background: 'linear-gradient(0deg, rgba(28,35,33,0.88) 0%, rgba(28,35,33,0.15) 65%)' }}>
        <div className="text-brass text-[13px] tracking-[2px] mb-1.5">★★★★★</div>
        <h2 className="font-display text-stone text-2xl md:text-3xl m-0">{hotel?.name || 'Loading…'}</h2>
        <p className="text-stone/75 text-[13.5px] mt-1.5">
          {hotel?.address ? `${hotel.address}, ${hotel.city}` : ''} · Free WiFi · Concierge desk
        </p>
      </div>
    </div>
  )
}
