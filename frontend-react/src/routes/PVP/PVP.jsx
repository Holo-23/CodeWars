import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaRegStar, FaCheck } from "react-icons/fa";

import useConfigStore from "../../store/configStore";
import AudioButton from "../../components/AudioButton/AudioButton";
import Settings from "../Settings/Settings";
import "./PVP.css";
import bg from "../../assets/img/4455.jpg";
import clock from "../../assets/img/clock.png";
import charMan from "../../assets/img/final_male_anim_IDLE.gif";
import charWoman from "../../assets/img/final_female_anim_IDLE(fixed frames).gif";
import setting from "../../assets/img/settingbtn.png";
import xbtn from "../../assets/img/x.png";
import lose from "../../assets/audio/lose.mp3";
import win from "../../assets/audio/win.mp3";

import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import Console from "../../components/Console/Console";
import { socket } from "../../socket";
import { useLocation, useParams, useNavigate } from "react-router-dom";

export default function PVP() {
  const [sett, showSettings] = useState(false);
  const [surrender, showSurrender] = useState(false);
  const [confirm, showconfirm] = useState(false);
  const [playlosersound, setPlayLoserSound] = useState(false);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [seconds, setSeconds] = useState(60);
  const [victory, showVictory] = useState(false);
  const navigate = useNavigate();

  const question = [
    {
      question: "Write a function that returns the sum of two numbers",
      template: "def addTwo(a, b):",
      testCases: [
        {
          exe: "print(addTwo(3,5), end='')",
          answer: "8",
        },
        {
          exe: "print(addTwo(-3,-7), end='')",
          answer: "-10",
        },
        {
          exe: "print(addTwo(100,3000), end='')",
          answer: "3100",
        },
      ],
    },
  ];

  let hpremain = 100;
  const hpright = useRef();

  // generate a random number for question and answer
  // const rand = Math.floor(Math.random() * questions.length);
  const rand = 0;
  const location = useLocation();
  const userId = location.state;
  const room_id = useParams(":matchid").matchid;

  useEffect(() => {
    socket.on("match_result", async (data) => {
      if (data.msg === "You won!") {
        showVictory(true);
      }
    });

    socket.on("player_code_submit", (code) => {
      setOutput(code);
      console.log("hi", code);
    });

    socket.on("disconnect", () => {
      navigate("/home");
    });
  }, []);

  // useEffect(() => {
  //   console.log(victory);
  // }, [victory]);

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     setSeconds(seconds => {
  //         if (seconds === 0) {
  //           clearInterval(intervalId); // Stop the timer
  //           return 0;
  //         } else {
  //           return seconds - 1;
  //         }
  //       });
  //     }, 1000);

  //   return () => clearInterval(intervalId);
  // }, []);

  // display the settings UI
  const toggleSettings = () => {
    showSettings(!sett);
  };

  // display the surrender UI
  const toggleSurrender = () => {
    showSurrender(!surrender);
  };

  //Triggers when use click the confirm or check button
  const toggleConfirm = () => {
    showconfirm(!confirm);
    showSurrender(surrender);
    setPlayLoserSound(true);
    socket.emit("surrender", { room_id, userId });
    setTimeout(() => {
      setPlaySound(false);
    }, 3000);
  };

  // get the value inputted by user
  const handleInputChange = (value) => {
    setInput(value);
  };

  // for reset button to clear the text
  const handleReset = () => {
    setInput("");
  };

  // get the input then evaluate then display in the output container
  const handleClick = () => {
    const code = input;
    const playerDetails = {
      userId,
    };
    socket.emit("match_submit", {
      room_id,
      code,
      playerDetails,
      questionDetails: question[0],
    });
  };

  // confirmation if the output is equal to expected output
  // if (output == answer[rand]) {
  //   hpremain -= 100;
  //   console.log(hpremain);
  //   hpright.current.style.width = `${hpremain}%`;
  //   hpright.current.style.transition = "2s";
  //   if (hpremain == 0) {
  //     showconfirm(!confirm);
  //   }
  // }

  return (
    <>
      <div className={`settings-pvp  ${sett ? "on" : "off"}`}>
        <Settings isTransparent={true} />
      </div>
      <div className="container container-pvp">
        <img src={bg} alt="bg" className="pvp-bg" />
        <div className="pvp-container">
          <div className="pvp-container-content">
            <div className="pvp-container-left">
              <div className="pvp-left-content">
                <div className="question">
                  <p>
                    <strong>Q:</strong> {question[rand].question}
                  </p>
                </div>
              </div>
            </div>
            <div className="pvp-container-right">
              <div className="pvptop">
                <div className="pvptop-left">
                  <div className="hpbar">
                    <div className="hpbar-left" ref={hpright}></div>
                  </div>
                  <div className="firstchar">
                    <img src={charMan} alt="" />
                  </div>
                </div>
                <div className="pvptop-center">
                  <div className="clock">
                    <img src={clock} />
                  </div>
                  <div className="round">
                    <h2>{seconds}</h2>
                  </div>
                </div>
                <div className="pvptop-right">
                  <div className="hpbar">
                    <div className="hpbar-right" ref={hpright}></div>
                  </div>
                  <div className="secondchar">
                    <img src={charWoman} alt="" />
                  </div>
                </div>
                <div className="settings">
                  <img
                    src={!sett ? setting : xbtn}
                    alt=""
                    onClick={toggleSettings}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="pvpbottom">
            <div className="bottom-left">
              <div className="userinput">
                <CodeMirror
                  value={question[rand].template}
                  onChange={handleInputChange}
                  height="190px"
                  className="codemirror"
                  // extensions={[javascript({ jsx: true })]}
                  extensions={[python()]}
                  options={{
                    theme: "dark-one",
                    lineNumbers: true,
                    scrollbarStyle: null,
                    lineWrapping: true,
                  }}
                />
                <div className="buttons">
                  <div className="btn submitbtn" onClick={handleClick}>
                    SUBMIT
                  </div>
                  <div className="btn clearbtn" onClick={handleReset}>
                    CLEAR
                  </div>
                </div>
              </div>
            </div>
            <div className="bottom-right">
              <div className="outputs">
                <div className="display-output">
                  <h4>OUTPUT:</h4>
                  <h2>{output}</h2>
                </div>
                <div className="expected-output">
                  <h4>EXPECTED OUTPUT:</h4>
                  {/* <h2>{answer[rand].testCases}</h2> */}
                  <h2>nyao</h2>
                </div>
              </div>

              <div className="btn btn-exit" onClick={toggleSurrender}>
                EXIT
              </div>
            </div>
          </div>
        </div>
        {surrender && (
          <div className="surrender">
            <div className="surrender-container">
              <div className="surrender-top">
                <h1>Surrender</h1>
                <h1>
                  <span>Game</span>
                </h1>
              </div>
              <div className="surrender-content">
                <h2>Do you want to surrender?</h2>
                <div className="surr-star">
                  <h2>You will lose a</h2>
                  <span className="star">&#9733;</span>
                </div>
                <div className="surr-buttons">
                  <div
                    className="btn confirmbtn"
                    onClick={() => {
                      toggleConfirm();
                      toggleSurrender();
                    }}
                  >
                    <FaCheck className="check" />
                  </div>
                  <div className="btn" onClick={toggleSurrender}>
                    <span>X</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {confirm && (
          <div className="lose">
            <Link to="/">
              <div className="lose-container">
                <h1>DEFEAT</h1>
                <p>Click anywhere to return...</p>
              </div>
            </Link>
          </div>
        )}

        {victory && (
          <div className="win">
            <Link to="/">
              <div className="lose-container">
                <h1>Victory</h1>
                <p>Click anywhere to return...</p>
              </div>
            </Link>
          </div>
        )}

        {playlosersound && (
          <div>
            <audio autoPlay src={lose} type="audio/mpeg">
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </div>
    </>
  );
}
