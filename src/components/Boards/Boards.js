import React, { useState, useEffect } from "react";

import Grid from "@material-ui/core/Grid";
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Typography from '@material-ui/core/Typography';
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import { makeStyles } from "@material-ui/core/styles";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import Badge from "@material-ui/core/Badge";
import Drawer from "@material-ui/core/Drawer";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Divider from "@material-ui/core/Divider";

import { Map, Circle, Popup, Tooltip, TileLayer } from "react-leaflet";
import { Icon } from "leaflet";
import "./boards.css";
import { usePosition } from "../../services/GeoHook";

import EmptyState from "../EmptyState";

import Board from "./Board";
import Store from "../../services/Store";
const api = new Store();

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 20,
    maxWidth: 752
  },
  form: {
    "& > *": {
      margin: theme.spacing(1),
      width: 200
    }
  },
  demo: {
    backgroundColor: theme.palette.background.black
  },
  title: {
    margin: theme.spacing(1, 1, 1)
  },
  board: {
    fontFamily: "Times New Roman"
  },
  list: {
    width: 250
  },
  fullList: {
    width: "auto"
  },
  input: {
    marginTop: 50,
    display: "block"
  },
  bbox: {
    maxWidth: 345,
  },  
}));

const Boards = props => {
  const [geoboards, setGeoBoards] = useState([]);
  const [userboards, setUserBoards] = useState([]);  
  const [isLoading, setIsLoading] = useState(true);
  const classes = useStyles();
  const [dense, setDense] = React.useState(false);
  const [refresh, setRefresh] = useState(1);
  const [index, setIndex] = useState(0);
  const [submit, setsubmit] = useState(true);
  const [newBoardName, setNewBoardName] = useState("");
  const [radius, setRadius] = useState(20);
  const [newBoardDrawer, setNewBoardDrawer] = useState(false);
  const [showBoardDrawer, setShowBoardDrawer] = useState(false);  
  const [showBoardIndex, setShowBoardIndex] = useState(0);    
  const [showUserBoards, setShowUserBoards] = useState(false);     
  const { latitude, longitude, error } = usePosition(false);

  const NewBoard = async () => {
    try {
      const xx = await api.post("addb", {
        name: newBoardName,
        latitude,
        longitude,
        radius,
        uid
      });
      if (xx) setRefresh(refresh);
    } catch {
      throw new Error("api error - add new board");
    }
  };

  const toggleNewBoard = () => event => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setNewBoardDrawer(!newBoardDrawer);
  };

  const toggleShowBoard = (index) => event => {
    //get the board index
    setShowBoardIndex(index)//get the board index
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setShowBoardDrawer(!showBoardDrawer);
  };

  const toggleShowUserBoards = (index) => event => {
    //get the board index
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setShowUserBoards(!showUserBoards);
  };  

  const showBoard = () => {

    return  (<Board geoboards={geoboards[showBoardIndex]} uid={props.uid} back={() => {
      setShowBoardDrawer(false)
      setRefresh(refresh +1)
    }  }/>)
  }


  const getNewBoard = () => (
    <div className={classes.form} role="presentation">
      <TextField
        className={classes.input}
        id="inputName"
        label="Name"
        onChange={e => setNewBoardName(e.target.value)}
      />
      <TextField
        className={classes.input}
        type="number"
        id="inputRadius"
        label="Radius"
        onChange={e => setRadius(e.target.value)}
      />
      <IconButton
        aria-label="add"
        className={classes.input}
        color="primary"
        onClick={NewBoard}
      >
        {" "}
        New Borad{" "}
      </IconButton>
    </div>
  );

const userBoardsView = () => (
  <List dense={dense}>
    {userboards.map(x=>x.board).map(x => {
      return (
      <ListItem key={x._id}  display="flex">
        <Badge  color='primary' anchorOrigin={{vertical: 'bottom', horizontal: 'left' }} badgeContent={x.members} max={10000}>               
          <Card className={classes.root}>
            <CardActionArea>
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  {x.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">

                </Typography>
              </CardContent>
            </CardActionArea>
            <CardActions>
              <Button size="small" color="primary">
                GoTo
              </Button>
              <Button size="small" color="primary">
                Open
              </Button>
            </CardActions>
          </Card> 
        </Badge> 
      </ListItem>
    )})}
          <IconButton aria-label="add" color="primary" onClick={toggleShowUserBoards()}>
        {" "}
        <h3 onClick={toggleShowUserBoards(false)}> Back </h3>
      </IconButton>
  </List>  
)
  useEffect(() => {
    const link = `https://moralcode.xyz/_db/moral/moral/geoBoards?latitude=${latitude}&longitude=${longitude}&uid=${
      props.uid
    }&redius=${2000}`;
    console.log("_____    ", link);

    latitude &&
      fetch(link, {
        method: "GET",
        headers: new Headers({})
      })
        .then(res => res.json())
        .then(response => {
          const gb = response.geoBoards;
          const ub = response.userBoards;
          console.log("DDDGeoBoards:", response);
          const geoBoards = index === 0 ? gb : [...geoboards, ...gb];
          geoBoards.forEach((x,i) => x.index = i)
      
          setUserBoards(ub)                            
          setGeoBoards(geoBoards);
          setIsLoading(false);

        })
        .catch(error => {
          console.log("in the f catch ", error);
          setTimeout(() => {
            setIsLoading(false);
          }, 500);
        });
  }, [refresh, index, latitude]);

  const { uid } = props;

  return uid ? (
    <div>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"
        integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
        crossOrigin=""
      />
      <IconButton aria-label="add" color="primary" onClick={toggleNewBoard()}>
        {" "}
        <h3> boards </h3>
      </IconButton>
     
      {geoboards && (
        <div className={classes.demo}>
          {console.log("~~~~", geoboards)}
          {latitude && (
            <Map center={[latitude, longitude]} zoom={16}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              />
              {geoboards.map(x => {
                  console.log("-", x);
                  return (
                    <Circle
                      key={x.board._key}
                      color={x.onboard[0] ? 'red' : 'blue'}
                      center={x.board.location.coordinates}
                      radius={parseInt(x.board.radius)}
                      onClick={toggleShowBoard(x.index)}
                    > </Circle>
                  );
                })}
              <Circle center={[latitude, longitude]} radius={100} fillColor='red' ></Circle>
            </Map>
          )}    

      <IconButton aria-label="add" color="primary" onClick={toggleShowUserBoards()}>
        {" "}
        <h3> boards </h3>
      </IconButton>


        </div>
      )}
      <Backdrop className={classes.backdrop} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Drawer anchor="left" open={newBoardDrawer} onClose={toggleNewBoard()}>
        {getNewBoard()}
      </Drawer>
      <Drawer anchor="right" open={showBoardDrawer} onClose={toggleShowBoard()}>
        {showBoard()}
      </Drawer>   
      <Drawer anchor="bottom" open={showUserBoards} onClose={toggleShowUserBoards()}>
        {userBoardsView()}
      </Drawer>           
    </div>
  ) : (
    <EmptyState
      title={process.env.REACT_APP_TITLE}
      description={process.env.REACT_APP_DESCRIPTION}
    />
  );
};

export default Boards;
//  {list(geoboards, dense, props.uid)}
