import "./App.css";
import React from "react";
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";

import { BoxClient, BoxDeveloperTokenAuth } from "box-typescript-sdk-gen";
import { generateReadableStreamFromFile } from "box-typescript-sdk-gen/lib/internal/utilsBrowser.js";

function App() {
  const [items, setItems] = React.useState([]);
  const [client, setClient] = React.useState(null);
  const [currentFolder, setCurrentFolder] = React.useState("0");
  const fileInputRef = React.useRef(null);
  const[uploading, setUploading] = React.useState(false);

  let updateToken = (value) => {
    let auth = new BoxDeveloperTokenAuth({
      token: value.target.value,
    });
    let boxClient = new BoxClient({ auth });
    setClient(boxClient);
  };
  
  let getFiles = async (folderId) => {
    if (client === null) {
      alert("Please enter a developer token");
      return;
    }
    let entries = (await client.folders.getFolderItems(folderId)).entries;
    setItems(entries);
    setCurrentFolder(folderId);
  };

  const handleUploadButtonClick = () => {
    if (client === null) {
      alert("Please enter a developer token");
      return;
    }
    fileInputRef.current.click();
  }
  
  const handleFileUpload = async (event) => {
    if (client === null) {
      alert("Please enter a developer token");
       return;
      }
    const file = event.target.files[0];
    if (!file) {
      alert("Error: No file selected");
      return;
    }

    //check if the file is too large [more than 20MB] then use the chunked upload method.
    if (file.size > 20 * 1024 * 1024) {
      setUploading(true);
      try {
        const response = await client.chunkedUploads.uploadBigFile(
        generateReadableStreamFromFile(file),
        file.name,
        file.size,
        currentFolder,
      );
      console.log("Uploaded file : ",response);
      alert("File successfully uploaded");
      getFiles(currentFolder);
    } catch (error) {
      console.error("Error uploading file:", {
        message: error.message,
        statusCode: error.statusCode,
        responseStatus: error.response?.status,
        responseData: error.response?.data,
        requestDetails: error.request,
      });
      alert(`Error uploading file: ${error.message || "Unknown error"}`);
    } finally {
      setUploading(false);
    }
  }
    else {
      setUploading(true);
      try {
        // Prepare upload attributes
        const attributes = {
        name: file.name,
        parent: { id: currentFolder }
        };
        // Upload using the SDK
        const uploadResponse = await client.uploads.uploadFile({
        attributes: attributes,
        file: generateReadableStreamFromFile(file)
        });
        const uploadedFile = uploadResponse.entries[0];
        console.log("Uploaded file:", uploadedFile);
        alert(`Successfully uploaded ${file.name}`);
          // Refresh the file list after upload
          getFiles(currentFolder);
        } catch (error) {
          console.error("Error uploading file:", {
          message: error.message,
          statusCode: error.statusCode,
          responseStatus: error.response?.status,
          responseData: error.response?.data,
          requestDetails: error.request,
        });
        alert(`Error uploading file: ${error.message || "Unknown error"}`);
      } finally {
          setUploading(false);
        }
      }
    };
  
  let downloadFile = async (fileId) => {
    const fileInfo = await client.files.getFileById(fileId);
    const byteStream = await client.downloads.downloadFile(fileId);
    const destHandler = await window
      .showSaveFilePicker({
        suggestedName: fileInfo.name,
      })
      .catch((err) => {
        // The user cancelled the save prompt
        console.log(err);
      });
    if (destHandler === undefined) {
      return;
    }
    const writableStream = await destHandler.createWritable();
    byteStream.pipeTo(writableStream);
  };

  return (
    <div className="App">
      <header className="App-header">
        <Typography variant="h4" gutterBottom>
          Box File Manager
        </Typography>
        <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
          <TextField
            label="Developer Token"
            variant="outlined"
            onChange={updateToken}
            fullWidth
          />
        </Box>
        <Box display="flex" justifyContent="center" mb={2}>
          <Button variant="contained" size="small" onClick={() => getFiles("0")}>
            Get Root Folder
          </Button>
          &nbsp;
          <Button
            variant="contained"
            onClick={handleUploadButtonClick}
            size="small"
            disabled={uploading}
          >
            {uploading ? <CircularProgress size={24} /> : "Upload"}
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            hidden
            onChange={handleFileUpload}
          />
        </Box>
      </header>
      <Paper>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={`${item.type}-${item.id}`}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>
                    {item.type === "file" ? (
                      <Button
                        variant="contained"
                        color="primary"
                        size = "small"
                        onClick={() => downloadFile(item.id)}
                      >
                        Download
                      </Button>
                    ) : item.type === "folder" ? (
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={() => getFiles(item.id)}
                      >
                        Open
                      </Button>
                    ) : item.type === "web_link" ? (
                      <a href={item.url} target="_blank" rel="noreferrer">
                        <Button variant="contained" color="default">
                          Open
                        </Button>
                      </a>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
}

export default App;
