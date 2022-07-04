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


function App() {

  const [pass, setPass] = useState("");
  const [modalpass, setModalPass] = useState("");
  const [encrypt, setEncrypt] = useState();
  const [decrypt, setDecrypt] = useState();
  const [modalData, setModalData] = useState();
  const [url, setUrl] = useState('');
  const [open, setOpen] = React.useState(false);

  const handleOpen = (e) => {
    setOpen(true);
    setModalData(e);
  };

  const handleClose = () => setOpen(false);

  const client = create('https://ipfs.infura.io:5001/api/v0')

  async function onChangeAvatar(e) {
    // const file = e.target.files[0]; 

    var iv = cryptoJs.enc.Base64.parse("");//giving empty initialization vector
    var key = cryptoJs.SHA256(pass);//hashing the key using SHA256
    var encryptedString = getEncryptData(e, iv, key);
    console.log(encryptedString, "sdfs");
    encryptedString.then(async (e) => {
      console.log(e, "eeeee");
      const added = await client.add(e)
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      setUrl(url);
      // const dd = await axios.get(element);

    })

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

  console.log(url, "url");


  const encryptData = async () => {
    const dataD = [];
    // var ciphertext = await cryptoJs.AES.encrypt(url, pass).toString(); 
    // console.log(ciphertext,"ciphertext"); 
    // url.then((e)=>{
    dataD.push({ encrypt: url, decrypt: '' });
    // }) 
    setEncrypt(dataD);
    setPass("");
    toast.success("Data Successfully Encrypted!")
  }


  // const decryptData = () => {
  // var bytes  = cryptoJs.AES.decrypt(ciphertext, 'secret key 123');
  // var originalText = bytes.toString(cryptoJs.enc.Utf8);
  // }

  function truncate(str, max, sep) {
    max = max || 15;
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

    console.log(modalData, "modalData");

    const dd = await axios.get(modalData);
    console.log(dd.data, "dd");
    var decrypteddata = decryptData(dd.data.toString(), iv, key);

    console.log(decrypteddata, "alert");

    if (decrypteddata == '') {
      toast.error("Invalid pass phrase! Please try again.");
      return false;
    }

    console.log(decrypteddata, "decrypteddata");//genrated decryption string:  Example1





    // var bytes = cryptoJs.AES.decrypt(modalData, modalpass);
    // var originalData = bytes.toString(cryptoJs.enc.Utf8);

    // console.log(originalData, "originalData");

    // if(!/^data:/.test(originalData)){
    //   alert("Invalid pass phrase or file! Please try again.");
    //   return false;
    // }

    const newArray = encrypt && encrypt.map(e => {
      if (e.encrypt == modalData) {
        return { ...e, decrypt: decrypteddata };
      }
      return e;
    })
    setEncrypt(newArray);
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
    console.log(decrypted, "decrypted");
    return decrypted.toString(cryptoJs.enc.Utf8);
  }


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
              <TextField fullWidth onChange={(e) => setPass(e.target.value)} label="Enter Pass phrase" id="fullWidth" />

              <Typography align='left' gutterBottom variant="h5" component="div" sx={{marginTop:'10px'}}>
                Message: 
              </Typography>
              <TextField fullWidth onChange={(e) => onChangeAvatar(e.target.value)} label="Enter Message" id="fullWidth" />
              {/* <div className='' style={{ margin: '10px 0', textAlign: 'left' }}>
                <input
                  accept="image/*"
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
              </div> */}
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
                  <TableCell align="right">Image</TableCell>

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
                        row.decrypt == "" ? <Button variant='contained' onClick={() => handleOpen(row.encrypt)}>Decrypt Data</Button> : truncate(row.decrypt)
                      }
                    </TableCell>
                    <TableCell align="right">
                      {
                        row.decrypt && <p>{row.decrypt}</p>
                      }
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
