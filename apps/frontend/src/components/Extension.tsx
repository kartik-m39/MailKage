import React, { useState } from "react";
import RefreshButton from "../../../../packages/ui/src/RefreshButton";
import CopyIcon from "../../../../packages/ui/src/CopyIcon"
import copy from "copy-to-clipboard";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const baseUrl = "http://localhost:5001";

type inboxItem = {
  address: string;
  subject: string;
  from: string;
  body:string;
  receivedAt: string;
  _id:string;
  __v: number;
};

const Popup: React.FC = () => {

  const [tempmail, setTempMail] = useState<string>("");
  const [inbox, setInbox] = useState<inboxItem[]>();
  
  const [loading, setLoading] = useState(false);
  const [inboxMsg, setInboxMsg] = useState(false);
  

  async function getTempMail(){
    try{
      setLoading(true);
        const response = await fetch(baseUrl + "/api/generate");
        const data = await response.json()
        console.log(data);
        setTempMail(data.email);
        setLoading(false);
    } catch(err){
        console.log(err);
    }
  }

  async function getInbox(){
      try{
          setInboxMsg(true)
          const response = await fetch(baseUrl + "/api/inbox");
          const data = await response.json();
          // setInbox(prev => [...prev, ...data.inbox])
          setInbox(data.inbox)
          setInboxMsg(false)
      } catch(err){
          console.log(err);
      }
  }

  function handleCopy(){
    const copyText = tempmail || "";
    const isCopy = copy(copyText);

    if(isCopy){
      toast.success("Copied to Clipboard");
    }
  }

  // useEffect(() => {
  //   getTempMail()
  // }, []);

  return (
    <div className="bg-gray-900 overflow-hidden border border-gray-800 shadow-lg w-[450px]">
      {/* Email address section */}
      <div className="p-4 pb-3">
        <div className="flex items-center mb-3">
          {tempmail ? <div className="flex-1 bg-gray-800 rounded-md py-2 px-3 text-gray-300 font-mono min-h-6">
            {tempmail}
          </div>: 
          <div className="flex-1 bg-gray-800 rounded-md py-2 px-3 text-gray-300 font-mono min-h-6">
          No temporary mail ...
        </div>
          }
          
          <div 
            className="ml-2 p-2 hover:bg-gray-800 rounded-md transition-colors"
            title="Copy to clipboard"
          >
            <CopyIcon onClick={handleCopy}/>
          </div>
        </div>
        
        {/* Get new email button */}
        <button 
          onClick={getTempMail}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md transition-colors font-medium text-sm"
        >
          {loading ? "Generating..." : "Get a New Email Address"}
        </button>
      </div>
      
      {/* Inbox section */}
      <div className="border-t-2 border-gray-800">
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-white font-medium text-lg">Inbox</h2>
          <div 
            onClick={getInbox} 
            className="p-1 hover:bg-gray-800 rounded-md transition-colors"
            title="Refresh inbox"
          >
            <RefreshButton onClick={getInbox}/>
          </div>
        </div>
        
        {/* Inbox content */}
        <div className="px-4 pb-4 h-56 mb-4">
        {inbox && inbox.length > 0 ? (
            <div className="bg-gray-800 rounded-md overflow-hidden">
              {inbox.map((email, index) => (
                <div 
                  key={email._id || index} 
                  className="p-3 border-b border-gray-700 hover:bg-gray-750 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium text-gray-300 truncate">{email.from}</div>
                    <div className="text-xs text-gray-500">{email.receivedAt || "Just now"}</div>
                  </div>
                  <div className="text-sm font-medium text-gray-400 truncate">{email.subject}</div>
                  <div className="text-xs text-gray-500 truncate mt-1">{email.body}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center bg-gray-800 rounded-md py-12 px-4 text-gray-500">
              <p className="text-sm">{inboxMsg ? "Loading..." : "No new Emails"}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <div className="border-t border-gray-800 p-3 text-center text-xs text-gray-500">
        <div className="flex items-center justify-center gap-1">
          Made by <a href="#" className="text-blue-400 hover:underline">KartikM</a>, Powered by <a href="#" className="text-blue-400 hover:underline">mail.tm</a>
          <span className="mx-1">•</span>
          <a href="#" className="text-blue-400 hover:underline">Buy me a coffee? ☕👍</a>
          <span className="mx-1">•</span>
          <a href="#" className="text-blue-400 hover:underline">Need help?</a>
        </div>
      </div>
      
      <ToastContainer
        position="top-center"
        autoClose={1000}
        hideProgressBar={true}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}

export default Popup;