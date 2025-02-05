import NavBar from '@/components/layout/Navbar'
import React from 'react'

const Terms = () => {
  return (
    <><NavBar backgroundColor="black" showBackButton={true} />
    <div
    className='container mx-auto px-4 py-8 text-gray-800 max-w-2xl mt-10'
    >
        <h2
        className='text-center'
        >Terms and Conditions</h2>
    <p><strong>Ausrealty Licensing Pty Ltd</strong></p>
    <p>Australian Company Number 680 757 608</p>
    <p>Effective Date: 5/2/2025</p>

    <h4>1. Introduction</h4>
    <p>Welcome to the website of Ausrealty Licensing Pty Ltd ("Company", "we", "our", "us"). By using this website, you agree to comply with and be bound by the following Terms and Conditions.</p>

    <h4>2. Use of Website</h4>
    <p>By accessing and using this website, you agree to:</p>
    <ul>
        <li>Use the website for lawful purposes only.</li>
        <li>Not engage in any activity that disrupts or interferes with the website’s functionality.</li>
        <li>Refrain from using automated systems to collect information from the website.</li>
    </ul>

    <h4>3. AI Disclaimer</h4>
    <p>Our website uses AI to provide responses related to real estate inquiries, sales data, and appraisals. While we strive for accuracy, users should be aware that AI-generated content is informational only and should not be solely relied upon for financial, legal, or real estate decisions.</p>

    <h4>4. No Guarantee of Accuracy</h4>
    <p>Real estate values, appraisals, and market conditions change frequently. AI-generated responses may not always reflect real-time data. We do not warrant the accuracy of AI-generated responses.</p>

    <h4>5. Limitation of Liability</h4>
    <p>Ausrealty Licensing Pty Ltd, its employees, agents, or affiliates shall not be liable for any loss or damages arising from reliance on AI-generated information or any other content on the website.</p>

    <h4>6. Intellectual Property</h4>
    <p>All content on this website, including text, graphics, logos, and software, is the property of Ausrealty Licensing Pty Ltd and is protected under copyright and intellectual property laws. Unauthorized use, reproduction, or distribution of website content is prohibited.</p>

    <h4>7. Governing Law</h4>
    <p>These Terms and Conditions are governed by the laws of New South Wales, Australia. Any disputes arising from the use of this website shall be subject to the exclusive jurisdiction of the courts of New South Wales.</p>

    <h4>8. Changes to Terms and Conditions</h4>
    <p>We reserve the right to modify these Terms and Conditions at any time without prior notice. Continued use of the website indicates acceptance of any changes.</p>

    <h4>9. Contact Information</h4>
    <p>For any inquiries regarding these Terms and Conditions, please contact us at <a href="mailto:ausrealty@ausrealty.com.au">ausrealty@ausrealty.com.au</a>.</p>

    <p>Last updated: 5/2/2025.</p>
    </div></>
  )
}

export default Terms