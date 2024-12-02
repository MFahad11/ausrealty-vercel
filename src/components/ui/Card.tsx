export default function Card({ title, mediaUrl, type, onClick }:{
    title: string,
    mediaUrl: string,
    type: 'image' | 'video' | 'pdf',
    onClick: () => void
}) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
        <div
        onClick={onClick}
         className="relative h-48">
          {
            type === 'image' ? (
            <img
              src={mediaUrl}
              alt={title}
            className="transition-transform duration-300 hover:scale-105 object-cover w-full h-full"
              
            />
          ) : type==='video'? (
            <video
  className="w-full h-full object-cover"
  autoPlay={true}
  loop
  preload="metadata"
  muted={true}
  controls={false}
  playsInline
  webkit-playsinline="true"
>
  <source src={mediaUrl} type="video/mp4" />
</video>
            ):(<div className="flex items-center justify-center w-full h-full bg-gray-100">
            <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 18h12a2 2 0 002-2V6a2 2 0 00-2-2h-3.93a2 2 0 01-1.66-.9l-.82-1.2A2 2 0 007.93 1H4a2 2 0 00-2 2v13c0 1.1.9 2 2 2z" />
              <path d="M7 11.5a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5a.5.5 0 01-.5-.5zm0 2a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5a.5.5 0 01-.5-.5zm0 2a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5a.5.5 0 01-.5-.5z" />
            </svg>
          </div>)}
        </div>
        <div className="p-4">
          <h5 className="font-bold mb-2 text-gray-800">{title}</h5>
          {/* <Button className="w-full black-button text-white py-2 px-4 " 
          onClick={onClick}
          >
            View {type === 'image' ? 'Image' : type === 'video'?'Video':"Pdf"}
          </Button> */}
        </div>
      </div>
    )
  }
