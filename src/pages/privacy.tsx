import NavBar from '@/components/layout/Navbar'
import React from 'react'

const Privacy = () => {
  return (
    <><NavBar backgroundColor="black" showBackButton={true} />
    <div
    className='container mx-auto px-4 py-8 text-gray-800 max-w-2xl mt-10'
    >
        <h2
        className='text-center'
        >Privacy Policy</h2>
    <p><strong>Ausrealty Licensing Pty Ltd</strong></p>
    <p>Australian Company Number 680 757 608</p>
    <p><strong>Effective Date:</strong> 5/2/2025</p>
    
    <h4>1. Introduction</h4>
    <p>Ausrealty Licensing Pty Ltd ("Company", "we", "our", "us") is committed to protecting the privacy of users who visit and interact with our website. This Privacy Policy outlines how we collect, use, store, and disclose personal information.</p>
    
    <h4>2. Information We Collect</h4>
    <p>We may collect the following types of personal information:</p>
    <ul>
        <li>Name, email address, and phone number</li>
        <li>Search activity and inquiries made through our website</li>
        <li>Other voluntarily provided details</li>
    </ul>
    
    <h4>3. Purpose of Data Collection</h4>
    <p>We use collected data to:</p>
    <ul>
        <li>Provide AI-driven property information and responses</li>
        <li>Assist in lead generation for real estate inquiries</li>
        <li>Improve user experience and website performance</li>
        <li>Notify agents about search activity related to Ausrealty Licensing Pty Ltd</li>
        <li>Communicate with users regarding inquiries or property-related updates</li>
    </ul>
    
    <h4>4. Data Retention</h4>
    <p>We store user data indefinitely for internal use unless a user requests deletion.</p>
    
    <h4>5. Data Sharing</h4>
    <p>We do not sell or distribute user data to external third parties. However, we may share collected information internally within Ausrealty Licensing Pty Ltd for real estate-related purposes.</p>
    
    <h4>6. User Rights</h4>
    <p>Users may request deletion of their data or inquire about their stored information by contacting <a href="mailto:ausrealty@ausrealty.com.au">ausrealty@ausrealty.com.au</a>.</p>
    
    <h4>7. Security Measures</h4>
    <p>We implement reasonable security measures to protect personal information from unauthorized access or misuse. However, no data transmission over the internet can be guaranteed as 100% secure.</p>
    
    <h4>8. Contact Information</h4>
    <p>For any inquiries regarding this Privacy Policy, AI-generated content, or data privacy, please contact us at <a href="mailto:ausrealty@ausrealty.com.au">ausrealty@ausrealty.com.au</a>.</p>
    
    <h4>9. Changes to This Privacy Policy</h4>
    <p>This Privacy Policy may be updated at any time without prior notice. Continued use of the website indicates acceptance of any changes.</p>
    <p><strong>Last updated:</strong> 5/2/2025.</p>
    </div></>
    



  )
}

export default Privacy