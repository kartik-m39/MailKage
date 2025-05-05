import React, { useEffect, useState } from "react";
import RefreshButton from "../../../../packages/ui/src/RefreshButton";
import CopyIcon from "../../../../packages/ui/src/CopyIcon"
import copy from "copy-to-clipboard";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



const baseUrl = "http://localhost:3000";




const Popup: React.FC = () => {

  const [tempmail, setTempMail] = useState<string>("");
  const [inbox, setInbox] = useState<any>();

  async function getTempMail(){
    try{
        const response = await fetch(baseUrl + "/tempmail");
        setTempMail(response?.token);
    } catch(err){
        console.log(err);
    }
  }

  async function getInbox(){
      try{
          const response = await fetch(baseUrl + "/inbox", {
            method: 'GET', 
            headers: { 
            'Content-Type': 'application/json', 
            'Authorization': token
            } });
          return response.json();
      } catch(err){
          console.log(err);
      }
  }

  function handleCopy(){
    const copyText = "tempmail";
    const isCopy = copy(copyText);

    if(isCopy){
      toast.success("Copied to Clipboard");
    }
  }

  useEffect(() => {
    setTempMail(tempmail);
  }, [getTempMail])


  return <>
    <div className="bg-gray-700 w-[350px] relative p-4">

      <div className="flex items-center justify-around gap-2 mb-2">

        {tempmail && <div className="w-[300px] bg-blue-950 p-2 rounded-md">
          {tempmail}
        </div> }

        <div className="w-[300px] bg-blue-950 p-2 rounded-md">
          No new tempMail
        </div>
        

        <div>
          <CopyIcon onClick={handleCopy}/>
        </div>
      </div>

      <div>
        <button className="bg-purple-800 px-4 py-2 rounded-md">
          Generate Temporary mail
        </button>
      </div>


      <div className="flex items-center justify-between">
        <div>
          Inbox
        </div>

        <div>
            <RefreshButton onClick={getInbox}/>
        </div>
      </div>

      <ToastContainer
      position="top-center"
      autoClose={500}
      hideProgressBar
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
    />

    </div>
  </>
}

export default Popup;