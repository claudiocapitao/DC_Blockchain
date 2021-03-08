import React, { useRef, useState } from 'react';
import  { Button } from 'react-bootstrap'

function Copy(props) {

  const [copySuccess, setCopySuccess] = useState('');
  const textAreaRef = useRef(null);

  function copyToClipboard(e) {
    textAreaRef.current.select();
    document.execCommand('copy');
    e.target.focus();
    setCopySuccess('Copied!');
  };

  return (
    <div>
      {
       document.queryCommandSupported('copy') &&
        <div>
          <Button variant="outline-dark" onClick={copyToClipboard}>Copy</Button> 
          {copySuccess}
        </div>
      }
      <br/>
      <form>
        <textarea
          ref={textAreaRef}
          value={props.text}
          style={{width: "100%"}}
          rows="6"
        />
      </form>
      {/* <div>
          <p ref={textAreaRef}>{props.text}</p>
      </div> */}
      
    </div>
  );
}

export default Copy;