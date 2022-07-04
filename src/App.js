import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react';
import { Box, Button, Card, CardActions, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Stack, TextField, Typography } from '@mui/material';
import { create } from 'ipfs-http-client'
import cryptoJs from 'crypto-js';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Modal from '@mui/material/Modal';
import axios from 'axios';
import { toast } from 'react-toastify';
import PDFViewer from 'pdf-viewer-reactjs'
import { Viewer } from '@react-pdf-viewer/core';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";


function App() {
  let docToPrint = React.createRef();

  const [pass, setPass] = useState("");
  const [modalpass, setModalPass] = useState("");
  const [encrypt, setEncrypt] = useState();
  const [photo, setPhoto] = useState();
  const [message, setMessage] = useState();
  // const [ephoto, setEPhoto] = useState();
  const [emessage, setEMessage] = useState();
  const [modalData, setModalData] = useState();
  const [url, setUrl] = useState('');
  const [pdfe, setPdf] = useState('');
  const [blobs, setBlobs] = useState('');
  const [open, setOpen] = React.useState(false);

  const handleOpen = (e) => {
    setOpen(true);
    setModalData(e);
  };

  const handleClose = () => setOpen(false);

  const client = create('https://ipfs.infura.io:5001/api/v0')

  async function onChangeMessage(e) {
    // const file = e.target.files[0];  
    setEMessage(e);
    var iv = cryptoJs.enc.Base64.parse("");//giving empty initialization vector
    var key = cryptoJs.SHA256(pass);//hashing the key using SHA256
    var encryptedString = getEncryptData(e, iv, key);
    console.log(encryptedString, "sdfs");
    encryptedString.then(async (e) => {
      setMessage(e);
      // console.log(e, "eeeee");
      // const added = await client.add(e)
      // const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      // setUrl(url);
      // const dd = await axios.get(element);

    })

  }


  const onChangeAvatar = (e) => {
    const file = e.target.files[0];

    console.log(file.name, "name");
    console.log(file.type, "type");
    console.log(file.size, "size");

    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {

      var b64 = reader.result.replace(/^data:.+;base64,/, ''); 
      var iv = cryptoJs.enc.Base64.parse("");
      var key = cryptoJs.SHA256(pass)
      var encryptedString = getEncryptData(reader.result, iv, key);
      encryptedString.then(async (e) => {
        setPhoto(e);
      })
    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
    };
  }

  const getEncryptData = async (data, iv, key) => {

    var encryptedString;
    if (typeof data == "string") {
      data = data.slice();
      encryptedString = cryptoJs.AES.encrypt(data, key, {
        iv: iv,
        mode: cryptoJs.mode.CBC,
        padding: cryptoJs.pad.Pkcs7
      });
    }
    else {
      encryptedString = cryptoJs.AES.encrypt(JSON.stringify(data), key, {
        iv: iv,
        mode: cryptoJs.mode.CBC,
        padding: cryptoJs.pad.Pkcs7
      });
    }
    return encryptedString.toString();
  }
 


  const encryptData = async () => {

    const enData = JSON.stringify({
      message: message,
      photo: photo
    });
    const added = await client.add(enData);
    console.log(added, "added");
    const url = `https://ipfs.infura.io/ipfs/${added.path}`; 
 

    const dataD = [];
    // var ciphertext = await cryptoJs.AES.encrypt(url, pass).toString(); 
    
    // url.then((e)=>{
    dataD.push({ encrypt: url, decrypt: '' });
    // }) 
    setEncrypt(dataD); 
    toast.success("Data Successfully Encrypted!")
    setEMessage("");
    setPass("");
  }

  function truncate(str, max, sep) {
    max = max || 35;
    var len = str.length;
    if (len > max) {
      sep = sep || "...";
      var seplen = sep.length;
      if (seplen > max) { return str.substr(len - max) }

      var n = -0.5 * (max - len - seplen);
      var center = len / 2;
      return str.substr(0, center - n) + sep + str.substr(len - center + n);
    }
    return str;
  }

  const getDecryptedData = async () => {

    var iv = cryptoJs.enc.Base64.parse("");
    var key = cryptoJs.SHA256(modalpass);  

    const dd = await axios.get(modalData); 
    var decrypteddata = decryptData(dd.data.message.toString(), iv, key);
    var decrypteddataPhoto = decryptData(dd.data.photo.toString(), iv, key);
 

    if (decrypteddata == '' || decrypteddataPhoto == '') {
      toast.error("Invalid pass phrase! Please try again.");
      return false;
    }

    const decDeta = {
      mes: decrypteddata,
      pho: decrypteddataPhoto,
    }
    const newArray = encrypt && encrypt.map(e => {
      if (e.encrypt == modalData) {
        return { ...e, decrypt: decDeta };
      }
      return e;
    })

    setEncrypt(newArray);

    const blob = base64toBlob(decrypteddataPhoto);
    setBlobs(blob); 
    const pdfurl = URL.createObjectURL(blob);
    setPdf(pdfurl); 
    toast.success("Data Successfully Decrypted!")
    handleClose();
  }



  function decryptData(encrypted, iv, key) {

    console.log(encrypted, iv, key, "key");
    var decrypted = cryptoJs.AES.decrypt(encrypted, key, {
      iv: iv,
      mode: cryptoJs.mode.CBC,
      padding: cryptoJs.pad.Pkcs7
    }); 
    return decrypted.toString(cryptoJs.enc.Utf8);
  }


  async function storeFiles() {
    const input = docToPrint.current;
    // const token = process.env.API_TOKEN;
    // const client = new Web3Storage({ token });

    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [900, 600],
      });
      // uploadBook(pdf);

      pdf.addImage(imgData, "JPEG", 0, 0);
      pdf.save("encrypt.pdf");
    });
  }





  const base64toBlob = (data) => {
    // Cut the prefix `data:application/pdf;base64` from the raw base 64
    const base64WithoutPrefix = data.substr('data:application/pdf;base64,'.length);

    const bytes = atob(base64WithoutPrefix);
    let length = bytes.length;
    let out = new Uint8Array(length);

    while (length--) {
      out[length] = bytes.charCodeAt(length);
    } 
    return new Blob([out], { type: 'application/pdf' });
  }; 

  return (
    <div className="App">
      <h1>Encrypted Demo</h1>


      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogContent style={{ overflowX: "hidden" }}>
          <DialogTitle>Decrypt Data</DialogTitle>
          <Stack spacing={3}>
            <TextField fullWidth onChange={(e) => setModalPass(e.target.value)} label="Enter Pass phrase" id="fullWidth" />
          </Stack>
          <DialogActions>
            < Button
              type="button"
              variant="contained"
              // loading={formik.isSubmitting}
              // disabled={props.loading}
              onClick={getDecryptedData}
            >
              Decrypt Data
            </ Button>
            <Button onClick={handleClose} variant="contained">
              Cancel
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>

      <Grid container spacing={2}>
        <Grid item xs={9} marginX="auto">
          <Card sx={{ maxWidth: 500 }}>
            <CardContent>
              <Typography align='left' gutterBottom variant="h5" component="div">
                Pass Phrase
              </Typography>
              <TextField fullWidth value={pass} onChange={(e) => setPass(e.target.value)} label="Enter Pass phrase" id="fullWidth" />

              <Typography align='left' gutterBottom variant="h5" component="div" sx={{ marginTop: '10px' }}>
                Message:
              </Typography>
              <TextField fullWidth value={emessage} onChange={(e) => onChangeMessage(e.target.value)} label="Enter Message" id="fullWidth" />
              <div className='' style={{ margin: '10px 0', textAlign: 'left' }}>
                <input
                  className="inputFile"
                  id="contained-button-file"
                  multiple
                  onChange={(e) => onChangeAvatar(e)}
                  type="file"
                />
                <label htmlFor="contained-button-file" >
                  <Button variant="contained" component="span" className="upload">
                    Upload File
                  </Button>
                </label>
              </div>
            </CardContent>
            <CardActions>
              <Button variant='contained' onClick={encryptData}>Encrypt</Button>
            </CardActions>
          </Card>


          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell align="right">Encrypted Data</TableCell>
                  <TableCell align="right">Decrypted Data</TableCell>
                  <TableCell align="right">File</TableCell>
                  <TableCell align="right">Download</TableCell>

                </TableRow>
              </TableHead>
              <TableBody>
                {encrypt && encrypt.map((row, i) => (
                  <TableRow
                    key={i}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {i}
                    </TableCell>
                    <TableCell align="right">
                      {truncate(row.encrypt)}
                    </TableCell>

                    <TableCell align="right">
                      {
                        row.decrypt == "" ? <Button variant='contained' onClick={() => handleOpen(row.encrypt)}>Decrypt Data</Button> : row.decrypt.mes
                      }
                    </TableCell>
                    <TableCell  align="right">
                      {
                        row.decrypt && <div>
                          {
                            blobs.type != 'application/pdf' && <img src={row.decrypt.pho} width="100" height="100" />
                          }

                        </div>
                      }

{
                      blobs.type == 'application/pdf' && <div
                        style={{
                          border: '1px solid rgba(0, 0, 0, 0.3)',
                          height: '350px',
                          width: '300px'
                        }}
                        ref={docToPrint}
                      > <Viewer   onZoom={20} fileUrl={pdfe && pdfe} /> </div>
                    }



                    </TableCell>
                    
                    <TableCell>
                      <Button variant="outlined" onClick={() => storeFiles()}>
                        Download PDF !
                      </Button>
                    </TableCell>
                  </TableRow>

                ))}
              </TableBody>
            </Table>
          </TableContainer>


        </Grid>
      </Grid>


    </div>
  );
}

export default App;
