import React from 'react';
import './SelectEmployee.css';

function Employee() {
  return (
    <div className="team">
      <h2>Team</h2>
      <div className="employee-grid">
        <div className="employee-card">
          <img 
            src="https://randomuser.me/api/portraits/men/1.jpg" 
            className="employee-image" 
          />
          <h3>John Doe</h3>
          <p>john@xyz.com</p>
          <p>+91 98765 43210</p>
          <p>Project Manager</p>
        </div>

        <div className="employee-card">
          <img 
            src="https://randomuser.me/api/portraits/women/2.jpg" 
            className="employee-image" 
          />
          <h3>Jane Smith</h3>
          <p>jane@xyz.com</p>
          <p>+91 98765 43211</p>
          <p>Software Developer</p>
        </div>

        <div className="employee-card">
          <img 
            src="https://randomuser.me/api/portraits/men/3.jpg" 
            className="employee-image" 
          />
          <h3>Michael Johnson</h3>
          <p>michael@xyz.com</p>
          <p>+91 98765 43212</p>
          <p>UI/UX Designer</p>
        </div>

        <div className="employee-card">
          <img 
            src="https://randomuser.me/api/portraits/women/4.jpg" 
            className="employee-image" 
          />
          <h3>Emily Davis</h3>
          <p>emily@xyz.com</p>
          <p>+91 98765 43213</p>
          <p>Customer Support</p>
        </div>

        <div className="employee-card">
          <img 
            src="https://randomuser.me/api/portraits/men/5.jpg" 
            className="employee-image" 
          />
          <h3>David Wilson</h3>
          <p>david@xyz.com</p>
          <p>+91 98765 43214</p>
          <p>DevOps Engineer</p>
        </div>

        <div className="employee-card">
          <img 
            src="https://randomuser.me/api/portraits/women/6.jpg" 
            className="employee-image" 
          />
          <h3>Sarah Lee</h3>
          <p>sarah@xyz.com</p>
          <p>+91 98765 43215</p>
          <p>Data Analyst</p>
        </div>

        <div className="employee-card">
          <img 
            src="https://randomuser.me/api/portraits/men/7.jpg" 
            className="employee-image" 
          />
          <h3>Chris Evans</h3>
          <p>chris@xyz.com</p>
          <p>+91 98765 43216</p>
          <p>Quality Assurance</p>
        </div>

        <div className="employee-card">
          <img 
            src="https://randomuser.me/api/portraits/women/8.jpg" 
            className="employee-image" 
          />
          <h3>Olivia Brown</h3>
          <p>olivia@xyz.com</p>
          <p>+91 98765 43217</p>
          <p>Marketing Specialist</p>
        </div>

        <div className="employee-card">
          <img 
            src="https://randomuser.me/api/portraits/men/9.jpg" 
            className="employee-image" 
          />
          <h3>James Miller</h3>
          <p>james@xyz.com</p>
          <p>+91 98765 43218</p>
          <p>HR Manager</p>
        </div>

        <div className="employee-card">
          <img 
            src="https://randomuser.me/api/portraits/women/10.jpg" 
            className="employee-image" 
          />
          <h3>Ava Martinez</h3>
          <p>ava@xyz.com</p>
          <p>+91 98765 43219</p>
          <p>Business Analyst</p>
        </div>
      </div>
    </div>
  );
}

export default Employee;


