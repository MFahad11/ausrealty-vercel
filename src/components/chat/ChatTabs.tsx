import React from 'react'

const ChatTabs = ({ title, description,onClick }:{
    title: string,
    description: string,
    onClick: () => void
}) => (
    <div className="bg-white rounded-xl p-3 shadow-sm cursor-pointer border border-darkgray"
    onClick={onClick}
    >
      <p 
      className='font-lato mb-2'
      style={{
        fontWeight: '400'
      }}
      >{title}</p>
      <p
      className='mb-0 font-lato'
      style={{
        fontWeight: '300',
        fontSize: '14px'
      }}
      
      >{description}</p>
    </div>
);
export default ChatTabs