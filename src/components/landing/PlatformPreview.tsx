
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function PlatformPreview() {
  const navigate = useNavigate();
  
  return (
    <div className="w-full bg-gradient-to-br from-black to-audifyx-purple-dark min-h-screen flex flex-col md:flex-row items-center justify-center md:justify-between p-4 md:p-8 lg:p-12 gap-8">
      <div className="flex-1 max-w-xl text-center md:text-left">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 landing-header">
          Welcome to Audifyx
        </h1>
        
        <p className="text-lg lg:text-xl mb-8 text-gray-300 landing-subtext">
          Discover new music, connect with artists, and join a vibrant creator-powered community where every sound earns rewards.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
          <Button 
            onClick={() => navigate('/auth')} 
            className="btn text-lg px-8 py-6"
          >
            Get Started
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/discover')} 
            className="text-lg px-8 py-6 border-audifyx-purple hover:bg-audifyx-purple/10"
          >
            Explore
          </Button>
        </div>
      </div>
      
      <div className="relative flex-1 max-w-md">
        <div className="phone-container">
          <div className="phone">
            <div className="phone-inner">
              <div className="phone-screen">
                <div className="phone-app">
                  <div className="app-header">
                    <div className="app-logo">Audifyx</div>
                  </div>
                  <div className="app-content">
                    <div className="app-feed">
                      <div className="feed-item">
                        <div className="feed-avatar"></div>
                        <div className="feed-content">
                          <div className="feed-text"></div>
                          <div className="feed-audio"></div>
                        </div>
                      </div>
                      <div className="feed-item">
                        <div className="feed-avatar"></div>
                        <div className="feed-content">
                          <div className="feed-text"></div>
                          <div className="feed-image"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .landing-header {
          animation: fadeInUp 1s ease-in-out;
        }
        
        .landing-subtext {
          animation: fadeInUp 1.5s ease-in-out;
        }
        
        .btn {
          background: linear-gradient(to right, #6a00f4, #8e2de2);
          color: white;
          border-radius: 8px;
          transition: 0.3s ease-in-out;
        }
        
        .btn:hover {
          transform: scale(1.05);
          box-shadow: 0 0 15px rgba(138, 43, 226, 0.6);
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .phone-container {
          position: relative;
          animation: floatPhone 4s ease-in-out infinite;
        }
        
        .phone {
          width: 280px;
          height: 550px;
          background: #111;
          border-radius: 36px;
          padding: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8),
                      0 0 20px rgba(106, 0, 244, 0.4),
                      0 0 60px rgba(142, 45, 226, 0.2);
          position: relative;
        }
        
        .phone-inner {
          width: 100%;
          height: 100%;
          background: #000;
          border-radius: 28px;
          overflow: hidden;
          position: relative;
        }
        
        .phone-screen {
          width: 100%;
          height: 100%;
          background: #101010;
          overflow: hidden;
          position: relative;
        }
        
        .phone:before {
          content: '';
          position: absolute;
          top: 18px;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 20px;
          background: #000;
          border-radius: 10px;
          z-index: 10;
        }
        
        .app-header {
          height: 60px;
          background: linear-gradient(to right, #6a00f4, #8e2de2);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 15px;
        }
        
        .app-logo {
          color: white;
          font-weight: bold;
          font-size: 18px;
        }
        
        .app-content {
          padding: 15px;
        }
        
        .app-feed {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .feed-item {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          padding: 12px;
          display: flex;
          gap: 10px;
        }
        
        .feed-avatar {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }
        
        .feed-content {
          flex: 1;
        }
        
        .feed-text {
          height: 12px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          margin-bottom: 10px;
        }
        
        .feed-image {
          height: 120px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }
        
        .feed-audio {
          height: 40px;
          background: rgba(106, 0, 244, 0.2);
          border-radius: 8px;
        }
        
        @keyframes floatPhone {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
      `}</style>
    </div>
  );
}
