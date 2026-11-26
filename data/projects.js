// All portfolio content lives here. Edit text, links or images, reload.
export const GROUPS = [
  { id: 'sw', no: '01', name: 'Software', kicker: 'Where I started', line: 'Hackathons, web apps and AI. 24-hour builds that taught me to ship.' },
  { id: 'hw', no: '02', name: 'Hardware', kicker: 'Where I’m headed', line: 'Boards, motors, sensors. Firmware that has to survive a real battery.' },
];

// art: name of a drawn illustration in main.js (used when there is no image)
export const PROJECTS = [
  {
    id: 'somewhere', group: 'sw', title: 'Somewhere', img: 'media/somewhere.jpg',
    line: 'Co-op escape game: one player draws, one hums, one speaks.',
    status: 'Devlympics · GDG NSUT · Live', link: 'https://somewhere-game.vercel.app',
    stack: ['React', 'Matter.js', 'WebRTC', 'Web Audio', 'Capacitor'],
    points: [
      'Theme “Bridge the Gap”: three players, three ways to talk.',
      'Sketcher draws objects into the level, Singer hums a melody lock, Oracle sees the traps.',
      'No AI: melody locks are matched in code (DTW).',
      'Built in 24 h at a national hackathon with ~500 teams. Website + APK.',
    ],
  },
  {
    id: 'weblyy', group: 'sw', title: 'Weblyy', img: 'media/weblyy.jpg',
    line: 'Paste a business URL: get a new website and a chat agent for it.',
    status: 'Live · MAITRON 2026', link: 'https://weblyy.vercel.app',
    stack: ['Next.js', 'Redis (Upstash)', 'Playwright', 'Vercel'],
    points: [
      'A headless browser crawls the site, scores it, then builds a themed site and a WhatsApp-style chat agent.',
      'Tested on 8 real Delhi businesses: clinics, salons, coaching centres.',
      'AI failover chain on free models: Groq → OpenRouter → Gemini → rule engine.',
      'Live on Vercel, built in a team of three.',
    ],
  },
  {
    id: 'northstar', group: 'sw', title: 'Northstar', img: 'media/northstar.jpg',
    line: 'Career copilot: your resume against the job you want, and the path to close the gap.',
    status: 'Open source', link: 'https://github.com/pranavverma04/resume-matcher',
    stack: ['Python', 'FastAPI', 'Sentence embeddings', 'SQLite', 'JavaScript'],
    points: [
      'Matches a resume to a job description with sentence embeddings (all-MiniLM-L6-v2), runs on a laptop CPU.',
      'Skill gap for 18 roles, with a week-by-week plan and learning links.',
      'Accounts, application tracker, analytics and an admin view for colleges.',
      'Builds a JD-tailored resume from one fixed template.',
    ],
  },
  {
    id: 'kampus', group: 'sw', title: 'Kampus', img: 'media/kampus.jpg',
    line: 'Campus app for students: attendance, timetable, ID, library.',
    status: 'PWA + Android',
    stack: ['HTML/CSS/JS', 'PWA', 'Android'],
    points: [
      'Clean-room student app, designed from the student side.',
      'Works offline as a PWA, also wrapped as an Android APK.',
      'Adds things the college app is missing.',
    ],
  },
  {
    id: 'mark', group: 'sw', title: 'MARK', img: 'media/mark.jpg',
    line: 'Review desk that catches “ghost faculty” in AICTE applications.',
    status: 'Smart India Hackathon', link: 'https://github.com/pranavverma04/MARK',
    stack: ['Next.js', 'Three.js', 'Canvas'],
    points: [
      'Problem SIH26261: faculty who exist on paper only.',
      'Graph of faculty shared across colleges, forensic view for edited documents.',
      'Rebuilt as MARK 2.0 with a tighter 3-feature scope.',
    ],
  },
  {
    id: 'firewatch', group: 'sw', title: 'FireWatch', img: 'media/firewatch.jpg',
    line: 'Finds factories that keep burning, from satellite fire data.',
    status: 'Kritical Hacks 2026 · team', link: 'https://github.com/pranavverma04/firewatch',
    stack: ['NASA FIRMS', 'OpenStreetMap', 'Python', 'Streamlit', 'JavaScript'],
    points: [
      'Joins NASA fire detections with industrial sites from OpenStreetMap.',
      'Flags a site when heat stays in the same spot for 3+ days.',
      'Checks 8 satellites (VIIRS, MODIS, Sentinel-3, Meteosat): newest pass in about 21 min instead of about 2 h 40 min.',
      'Back-tested on known industrial fires and on Punjab crop fires (false alarms).',
    ],
  },
  {
    id: 'membrane', group: 'sw', title: 'Membrane', img: 'media/membrane.jpg',
    line: 'Type 1 diabetes app: daily logs and health records in one place.',
    status: 'Finalist · IEEE PitchCraft 3.0',
    stack: ['Web', 'Android'],
    points: [
      'Two dashboards: daily T1D logging and health records.',
      'Website + APK for the offline round.',
    ],
  },
  {
    id: 'provo', group: 'sw', title: 'Provo', img: 'media/provo.jpg',
    line: 'Proof of work for students: copilot, drills, a work record.',
    status: 'Finalist · SDG 8 hackathon',
    stack: ['Next.js', 'LLM'],
    points: [
      'Builds a work record from what you actually did, not a score.',
      'Copilot + practice drills + interview kit.',
      'Reworked after judge feedback; shipped the new version.',
    ],
  },
  {
    id: 'dataheist', group: 'sw', title: 'DataHeist', art: 'board',
    line: 'CTF puzzles hide the data. Then you build the model.',
    status: 'Rank 3 public · Rank 4 final · DTU',
    stack: ['Python', 'scikit-learn', 'Ridge + GBM'],
    points: [
      'CTF × ML event at DTU, IEEE Day 2026: decode the puzzles to get the datasets.',
      'Race lap-time model: ridge + gradient boosting on the residual.',
      'Found that two of the five datasets were noise and dropped them.',
      'A simple ratio rule for safety-car laps beat the model there by 3–5×.',
    ],
  },
  {
    id: 'repoverse', group: 'sw', title: 'Repoverse', img: 'media/repoverse.jpg',
    line: 'Chat with any GitHub repo. Ask how it works, get the file.',
    status: 'Open source', link: 'https://github.com/pranavverma04/Repoex',
    stack: ['JavaScript', 'Node', 'LLM'],
    points: [
      'Reads a repo, maps files and explains the code in plain words.',
      'Plain HTML/CSS/JS front, one small JS server.',
    ],
  },
  {
    id: 'micrograd', group: 'sw', title: 'Own AI, from zero', art: 'graph',
    line: 'Building neural nets from scratch, one gradient at a time.',
    status: 'In progress · goal Jan 2027',
    stack: ['Python', 'Autograd', 'makemore'],
    points: [
      'Wrote micrograd: a tiny autograd engine and a neural net on top.',
      'Now on makemore: character-level language models.',
      'Goal: my own small model by January 2027.',
    ],
  },
  {
    id: 'rc-car', group: 'hw', title: 'RC Car', img: 'media/rc-car.jpg', video: 'media/rc-car.mp4', fy: 0.3,
    line: 'ESP32 car I drive from my phone over Wi-Fi.',
    status: 'Drives', link: 'https://github.com/pranavverma04/rc-car',
    stack: ['ESP32', 'FreeRTOS', 'TB6612FNG', 'HC-SR04', 'Kotlin', 'UDP'],
    flow: [
      ['RC Pilot app', 'UDP :4210', 'ESP32 · Wi-Fi AP', 'PWM', 'TB6612FNG', '', '2 DC motors'],
      ['HC-SR04', 'distance', 'ESP32', 'slow at 70 cm · brake at 25 cm', 'TB6612FNG'],
    ],
    bugs: [
      ['Car boot-looped 20+ times and would not drive', 'Weak AA cells browned out the ESP32 when the motors pulled current. Moved to a power bank supply.'],
      ['Sonar sometimes misses an echo', 'The anti-crash guard holds the last close reading for 600 ms, so one missed echo never means “road clear”.'],
      ['Loose wires on the motor driver', 'Wrote a check sketch that reads each line’s voltage: ~2.95 V wired, 3.06 V+ loose.'],
    ],
    points: [
      'ESP32 DevKit + TB6612 motor driver; the car hosts its own Wi-Fi network.',
      'Firmware split into FreeRTOS tasks: one reads the sonar, one drives the motors.',
      'RC Pilot: my own Android app (Kotlin + Compose) with sticks, tilt mode and a 400 ms failsafe.',
      'HC-SR04 anti-crash guard: slows at 70 cm, short-brakes at 25 cm.',
      'Wrote my own pin and wiring check sketches to find bad joints fast.',
    ],
  },
  {
    id: 'esp32-drone', group: 'hw', title: 'ESP32 Drone', img: 'media/drone.jpg', video: 'media/drone.mp4',
    line: 'Brushed quadcopter with flight code written from scratch.',
    status: 'Flight firmware',
    stack: ['ESP32', 'MPU6050', 'FreeRTOS', 'PID', 'Kotlin'],
    flow: [
      ['Drone Pilot app', 'HTTP /cmd · every 60 ms', 'ESP32'],
      ['MPU6050', 'I²C', 'ESP32 · PID @ 250 Hz', 'PWM', '4 × MOSFET', '', '4 brushed motors'],
    ],
    bugs: [
      ['Motors cut at ~36% throttle on battery, never on USB', 'A restart counter saved in flash showed 11 brownout resets. Fix: 1000 µF across the battery, 100 µF at the boost converter output.'],
      ['Control loop starved the web server', 'Moved from a busy-wait loop to a FreeRTOS task with vTaskDelayUntil, pinned to one core.'],
      ['One motor would not spin', 'Gate test: one channel at 1.8 V (wrong resistor), one at 0.13 V (solder bridge). Both found before power-on.'],
      ['Pushing the stick forward flew it backwards', 'Pitch sign was flipped in the command handler; fixed once for app and web page.'],
    ],
    points: [
      'Team build with Palash Kuchroo. 1S brushed quad, MOSFET motor drivers.',
      'Angle → rate PID in a 250 Hz FreeRTOS task, X mixer, crash cut at 60°.',
      'Traced battery brownouts with a restart counter, fixed with bulk caps.',
      'Drone Pilot Android app talks to the drone over HTTP.',
    ],
  },
  {
    id: 'handheld', group: 'hw', title: 'OLED Handheld', img: 'media/mp3.jpg', video: 'media/mp3.mp4',
    extra: { video: 'media/cricket.mp4', poster: 'media/cricket.jpg', caption: 'Same board running Pocket Cricket, my game for it.' },
    line: 'One OLED + joystick board: a pocket MP3 player and a cricket game.',
    status: 'Breadboard prototype',
    stack: ['ESP32', 'UNO R4', 'DFPlayer Mini', 'SH1106 OLED', 'C++'],
    flow: [
      ['Joystick', 'ADC', 'ESP32 / UNO R4', 'I²C', 'SH1106 OLED'],
      ['ESP32 / UNO R4', 'UART', 'DFPlayer Mini', '', '4 Ω speaker'],
    ],
    bugs: [
      ['Background hiss from the speaker', '1 kΩ in series with the DFPlayer RX line removed it.'],
      ['Joystick could damage the ESP32', 'Powered it from 3.3 V, not 5 V: ESP32 ADC pins are 3.3 V max.'],
      ['Tracks played in the wrong order', 'macOS leaves hidden ._ files on the SD card; cleaned with dot_clean.'],
      ['30 fps on a small board', 'Each game frame gets 33 ms for input, ball physics and drawing, so the scene is kept to simple shapes.'],
    ],
    points: [
      'MP3 player: DFPlayer Mini reads the SD card and drives a 4 Ω speaker; joystick menu on a 128×64 OLED.',
      'ESP32 version adds phone control over Bluetooth; also ported to Arduino UNO R4 (Renesas RA4M1).',
      'Pocket Cricket: a two-view cricket game at ~30 fps on the same screen and joystick.',
      'Shot direction comes from the joystick at the moment you swing; fielders chase the ball.',
    ],
  },

];


// Removed from the tunnel on 2026-11-25 to keep the site hardware-first. Move back into PROJECTS to show again.
export const ARCHIVE = [
  {
    id: 'brewora', group: 'web', title: 'Brewora', img: 'media/brewora.jpg',
    line: 'Coffee brand site with a scroll-scrubbed hero video.',
    status: 'Demo site',
    stack: ['HTML/CSS/JS', 'Video scrub'],
    points: [
      'Multi-page brand site: menu, beans, ordering bar.',
      'Hero video plays forward and back with your scroll.',
      'Made as a showcase for my website work.',
    ],
  },
  {
    id: 'override', group: 'web', title: 'Override', img: 'media/override.jpg',
    line: 'AI writes 80% of your project. Train for the 20% it gets wrong.',
    status: 'Solo build · runs locally',
    stack: ['Next.js', 'TypeScript'],
    points: [
      'Describe your project: see what AI can do and what you must learn.',
      '1v1 arena: both players get the same AI-written file and hunt the flawed line.',
      '53 challenges, 15 skills, ratings and a college leaderboard.',
    ],
  },
  {
    id: 'health-memory', group: 'hack', title: 'Health Memory', art: 'timeline',
    line: 'One person, one health timeline. Works offline.',
    status: 'Healthcare hackathon',
    stack: ['Kotlin', 'ML Kit OCR', 'Offline'],
    points: [
      'Reports, medicines and visits on one timeline.',
      'On-device OCR reads a prescription or lab report. No internet needed.',
      'Makes a one-page brief for the doctor.',
    ],
  },
  {
    id: 'legalbridge', group: 'hack', title: 'LegalBridge', img: 'media/legalbridge.jpg',
    line: 'Legal papers turned into plain language.',
    status: 'NSUT Hackathon 2026',
    stack: ['Web', 'LLM'],
    points: [
      'Legal text in, simple explanation out.',
      'Offline demo mode so the pitch never depends on Wi-Fi.',
    ],
  },
  {
    id: 'cringecourt', group: 'hack', title: 'CringeCourt', img: 'media/cringecourt.jpg',
    line: 'Puts shopping sites on trial for dark patterns.',
    status: 'Runs locally',
    stack: ['Browser agent', 'React', 'Node'],
    points: [
      'A browser agent checks a shopping site for dark patterns.',
      'Three detectors, each tested live.',
      'Shows the result as a courtroom trial with a verdict.',
    ],
  },
];



export const ABOUT = {
  facts: [
    ['Study', '2nd-year B.Tech, Electronics & Communication'],
    ['Where', 'MAIT (GGSIPU), Delhi · 2025–2029'],
    ['CGPA', '8.64'],
    ['Status', '<span class="otw"><i></i>Open to work</span> Remote embedded / firmware internship · Winter 2026 or Summer 2027'],
  ],
  now: [
    ['Designing', 'A 30.5 mm flight controller PCB in KiCad: STM32F411, ICM-42688 IMU, barometer, USB-C'],
    ['Learning', 'Cyber security from zero: OverTheWire Bandit levels 0–9 done'],
    ['Learning', 'Neural nets from scratch: micrograd done, now makemore'],
    ['Next', 'STM32 bare-metal C: my own register-level drivers, from January 2027'],
  ],
  results: [
    ['Rank 3 public / Rank 4 final', 'DataHeist, CTF × ML · IEEE Day, DTU'],
    ['Finalist', 'Membrane · IEEE PitchCraft 3.0'],
    ['Finalist', 'Provo · SDG 8 hackathon'],
    ['Built in 24 h', 'Somewhere · Devlympics, SHUNYA 2026 (GDG NSUT), ~500 teams'],
  ],
  skills: [
    ['Embedded', 'C / C++, ESP32, Arduino UNO R4, FreeRTOS tasks, PID, I²C, UART, PWM'],
    ['Parts I have used', 'MPU6050, TB6612FNG, HC-SR04, DFPlayer Mini, SH1106 OLED'],
    ['Debugging', 'Multimeter checks, serial logs, restart counters in flash'],
    ['Also', 'Kotlin (Android apps), JavaScript (web), Python (data)'],
  ],
  campus: [
    ['AWS Student Builder Group, MAIT', 'Video editing', 'I cut the reels for the society’s Instagram.'],
    ['Mindflare, MAIT', 'Event management', 'I help plan and run society events.'],
  ],
};

export const ME = {
  name: 'Pranav Verma',
  role: 'Embedded + web developer',
  place: 'MAIT, Delhi',
  email: 'pranavverma4851@gmail.com',
  github: 'https://github.com/pranavverma04',
  linkedin: 'https://www.linkedin.com/in/pranav-verma-2b1330433/',
  resume: 'media/Pranav-Verma-Resume.pdf',
};

// small tiles that make up the tunnel wall
export const CHIPS = [
  'ESP32', 'FreeRTOS', '250 Hz loop', 'PID', 'MPU6050', 'TB6612FNG', 'HC-SR04', 'UDP :4210',
  'DFPlayer Mini', 'SH1106 OLED', 'I²C 0x3C', 'UNO R4', 'RA4M1', 'softAP', '192.168.4.1', 'failsafe 400 ms',
  'X mixer', 'LiPo 1S', 'MT3608', 'DRV8833', 'ESP32-CAM', '1000 µF', 'brownout', 'short brake',
  'UART', 'I²C', 'PWM', 'ADC', 'GPIO', 'ISR', 'vTaskDelayUntil', 'WHO_AM_I 0x68',
  'KiCad', 'STM32F411', 'ICM-42688', 'arduino-cli', 'serial log', 'multimeter', 'bring-up', 'pull-down',
  'MOSFET gate', 'SS34 diode', '20 kHz PWM', 'dead zone', 'trim', 'gyro offset', 'accel offset', 'complementary',
  'C / C++', 'Preferences', 'watchdog', 'boot loop', '30 fps', 'joystick', 'joint check', 'solder bridge',
];
