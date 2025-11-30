import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowRight, 
  RefreshCcw, 
  Info, 
  Music, 
  Sigma, 
  Calculator, 
  Piano as PianoIcon, 
  BookOpen, 
  Keyboard, 
  ChevronRight, 
  Trash2,
  History
} from 'lucide-react';

// --- UI Library (ShadCN/UI Styled Components) ---

const cn = (...classes) => classes.filter(Boolean).join(' ');

const Button = ({ children, onClick, variant = 'default', size = 'default', className, disabled, ...props }) => {
  const base = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    default: "bg-zinc-50 text-zinc-900 hover:bg-zinc-50/90",
    destructive: "bg-red-900 text-zinc-50 hover:bg-red-900/90",
    outline: "border border-zinc-800 bg-background hover:bg-zinc-800 hover:text-zinc-50",
    secondary: "bg-zinc-800 text-zinc-50 hover:bg-zinc-800/80",
    ghost: "hover:bg-zinc-800 hover:text-zinc-50",
    link: "text-primary underline-offset-4 hover:underline",
    accent: "bg-emerald-600 text-zinc-50 hover:bg-emerald-600/90 shadow-sm",
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={cn(base, variants[variant], sizes[size], className)} 
      {...props}
    >
      {children}
    </button>
  );
};

const Card = ({ className, children }) => (
  <div className={cn("rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-50 shadow-sm backdrop-blur-xl", className)}>
    {children}
  </div>
);

const CardHeader = ({ className, children }) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)}>{children}</div>
);

const CardTitle = ({ className, children }) => (
  <h3 className={cn("text-2xl font-semibold leading-none tracking-tight", className)}>{children}</h3>
);

const CardDescription = ({ className, children }) => (
  <p className={cn("text-sm text-zinc-400", className)}>{children}</p>
);

const CardContent = ({ className, children }) => (
  <div className={cn("p-6 pt-0", className)}>{children}</div>
);

const Badge = ({ children, variant = 'default', className }) => {
  const variants = {
    default: "border-transparent bg-zinc-50 text-zinc-900 hover:bg-zinc-50/80",
    secondary: "border-transparent bg-zinc-800 text-zinc-50 hover:bg-zinc-800/80",
    outline: "text-zinc-50",
    destructive: "border-transparent bg-red-900 text-zinc-50 hover:bg-red-900/80",
    emerald: "border-transparent bg-emerald-900/30 text-emerald-400 border border-emerald-900",
    blue: "border-transparent bg-blue-900/30 text-blue-400 border border-blue-900",
  };
  return (
    <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", variants[variant], className)}>
      {children}
    </div>
  );
};

const Tabs = ({ value, onValueChange, children, className }) => (
  <div className={cn("w-full", className)}>
    {React.Children.map(children, child => 
      React.cloneElement(child, { selectedValue: value, onValueChange })
    )}
  </div>
);

const TabsList = ({ children, className, selectedValue, onValueChange }) => (
  <div className={cn("inline-flex h-10 items-center justify-center rounded-md bg-zinc-800/50 p-1 text-zinc-400", className)}>
    {React.Children.map(children, child => 
      React.cloneElement(child, { selectedValue, onValueChange })
    )}
  </div>
);

const TabsTrigger = ({ value, selectedValue, onValueChange, children, className }) => (
  <button
    onClick={() => onValueChange(value)}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      selectedValue === value 
        ? "bg-zinc-950 text-zinc-50 shadow-sm" 
        : "hover:bg-zinc-800 hover:text-zinc-100",
      className
    )}
  >
    {children}
  </button>
);

const Textarea = ({ className, ...props }) => (
  <textarea
    className={cn(
      "flex min-h-[80px] w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm ring-offset-background placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
);

const Separator = ({ className }) => (
  <div className={cn("shrink-0 bg-zinc-800 h-[1px] w-full my-4", className)} />
);


// --- Musical Constants & Logic ---

const NOTES = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const KEYBOARD_KEYS = [
  { note: 0, type: 'white', label: 'C' },
  { note: 1, type: 'black', label: 'C#' },
  { note: 2, type: 'white', label: 'D' },
  { note: 3, type: 'black', label: 'Eb' },
  { note: 4, type: 'white', label: 'E' },
  { note: 5, type: 'white', label: 'F' },
  { note: 6, type: 'black', label: 'F#' },
  { note: 7, type: 'white', label: 'G' },
  { note: 8, type: 'black', label: 'Ab' },
  { note: 9, type: 'white', label: 'A' },
  { note: 10, type: 'black', label: 'Bb' },
  { note: 11, type: 'white', label: 'B' },
  { note: 12, type: 'white', label: 'C' }, 
];

const mod = (n, m = 12) => ((n % m) + m) % m;
const normalize = (notes) => [...notes].map(n => mod(n)).sort((a, b) => a - b);
const arraysEqual = (a, b) => JSON.stringify(normalize(a)) === JSON.stringify(normalize(b));
const getNoteLabel = (n) => NOTES[mod(n)];

const CHORD_DEFINITIONS = [
  { name: 'Major', suffix: '', intervals: [0, 4, 7] },
  { name: 'Minor', suffix: 'm', intervals: [0, 3, 7] },
  { name: 'Diminished', suffix: 'dim', intervals: [0, 3, 6] },
  { name: 'Augmented', suffix: 'aug', intervals: [0, 4, 8] },
  { name: 'Major 7', suffix: 'maj7', intervals: [0, 4, 7, 11] },
  { name: 'Minor 7', suffix: 'm7', intervals: [0, 3, 7, 10] },
  { name: 'Dominant 7', suffix: '7', intervals: [0, 4, 7, 10] },
  { name: 'Diminished 7', suffix: 'dim7', intervals: [0, 3, 6, 9] },
  { name: 'Half Dim 7', suffix: 'm7b5', intervals: [0, 3, 6, 10] },
  { name: 'Sus 4', suffix: 'sus4', intervals: [0, 5, 7] },
  { name: 'Sus 2', suffix: 'sus2', intervals: [0, 2, 7] },
  { name: 'Add 9', suffix: 'add9', intervals: [0, 2, 4, 7] },
];

const identifyChord = (notes) => {
  const sorted = normalize(notes);
  for (let i = 0; i < sorted.length; i++) {
    const potentialRoot = sorted[i];
    const intervals = sorted.map(n => mod(n - potentialRoot)).sort((a, b) => a - b);
    const match = CHORD_DEFINITIONS.find(def => arraysEqual(def.intervals, intervals));
    if (match) {
      let type = 'Other';
      if (match.name === 'Major') type = 'Major';
      else if (match.name === 'Minor') type = 'Minor';
      else if (match.name === 'Diminished') type = 'Dim';
      else if (match.name.includes('7')) type = 'Seventh';
      return { root: potentialRoot, type, label: NOTES[potentialRoot] + match.suffix, name: match.name };
    }
  }
  return { root: sorted[0], type: 'Unknown', label: '?', name: 'Unknown' };
};

const parseChordString = (str) => {
  const regex = /^([A-G][#b]?)(.*)$/i;
  const match = str.trim().match(regex);
  if (!match) return null;
  const rootName = match[1].charAt(0).toUpperCase() + (match[1].slice(1) || '');
  let root = NOTES.indexOf(rootName);
  if (root === -1) {
      const enharmonics = {'Db':1, 'D#':3, 'Eb':3, 'Gb':6, 'G#':8, 'Ab':8, 'A#':10, 'Bb':10, 'E#': 5, 'B#': 0, 'Cb': 11, 'Fb': 4};
      root = enharmonics[rootName] !== undefined ? enharmonics[rootName] : -1;
  }
  if (root === -1) return null;
  const quality = (match[2] || '').toLowerCase();
  const def = CHORD_DEFINITIONS.sort((a, b) => b.suffix.length - a.suffix.length).find(d => {
       if (d.suffix === '' && (quality === '' || quality === 'maj' || quality === 'M')) return true;
       if (d.suffix === 'm' && (quality === 'min' || quality === '-')) return true;
       if (d.suffix === 'aug' && quality === '+') return true;
       if (d.suffix === 'dim' && quality === 'o') return true;
       return d.suffix === quality;
    });
  const intervals = def ? def.intervals : [0, 4, 7]; 
  return intervals.map(i => mod(root + i));
};

const getNegativeNote = (note, keyRoot = 0) => {
  const axisSum = keyRoot + mod(keyRoot + 7);
  return mod(axisSum - note);
};

const getNegativeChord = (chordNotes, keyRoot = 0) => chordNotes.map(n => getNegativeNote(n, keyRoot));

const transformP = (notes) => {
  const info = identifyChord(notes);
  const root = info.root;
  const isMajorLike = notes.some(n => mod(n - root) === 4);
  if (isMajorLike) return notes.map(n => mod(n - root) === 4 ? mod(n - 1) : n);
  else return notes.map(n => mod(n - root) === 3 ? mod(n + 1) : n);
};
const transformL = (notes) => {
  const info = identifyChord(notes);
  const root = info.root;
  const isMajorLike = notes.some(n => mod(n - root) === 4);
  if (isMajorLike) return notes.map(n => mod(n - root) === 0 ? mod(n - 1) : n);
  else return notes.map(n => mod(n - root) === 7 ? mod(n + 1) : n);
};
const transformR = (notes) => {
  const info = identifyChord(notes);
  const root = info.root;
  const isMajorLike = notes.some(n => mod(n - root) === 4);
  if (isMajorLike) return notes.map(n => mod(n - root) === 7 ? mod(n + 2) : n);
  else return notes.map(n => mod(n - root) === 0 ? mod(n - 2) : n);
};

// --- Main Component ---

const App = () => {
  const [mode, setMode] = useState('tonnetz');
  
  // Tonnetz State - Fixed initialization error by adding type: 'Major'
  const [currentChord, setCurrentChord] = useState([0, 4, 7]);
  const [history, setHistory] = useState([{ notes: [0, 4, 7], id: 'start', x: 0, y: 0, label: 'C Major', op: 'Start', type: 'Major' }]);
  const [edges, setEdges] = useState([]);
  const [viewBox, setViewBox] = useState({ x: -150, y: -150, w: 300, h: 300 });
  
  // Negative Harmony State
  const [negKey, setNegKey] = useState(0);
  const [progInput, setProgInput] = useState("Cmaj7 Am9 Dm7 G7");
  const [progOutput, setProgOutput] = useState([]);
  const [compactOutput, setCompactOutput] = useState("");
  const [melodyHistory, setMelodyHistory] = useState([]);
  
  const pressedKeysRef = useRef(new Set());
  const pathRef = useRef(null);

  const chordInfo = identifyChord(currentChord);
  
  const handleTransform = (type) => {
    let newNotes;
    if (type === 'P') newNotes = transformP(currentChord);
    else if (type === 'L') newNotes = transformL(currentChord);
    else if (type === 'R') newNotes = transformR(currentChord);
    
    const newInfo = identifyChord(newNotes);
    const prevNode = history[history.length - 1];
    
    let dx = 0, dy = 0;
    const dist = 60;
    if (type === 'P') { dy = chordInfo.type === 'Major' ? dist : -dist; }
    if (type === 'L') { dx = dist * 0.866; dy = chordInfo.type === 'Major' ? -dist * 0.5 : dist * 0.5; }
    if (type === 'R') { dx = -dist * 0.866; dy = chordInfo.type === 'Major' ? -dist * 0.5 : dist * 0.5; }

    const newNode = {
      notes: normalize(newNotes),
      id: `${newInfo.label}-${Date.now()}`,
      label: newInfo.label,
      type: newInfo.type,
      x: prevNode.x + dx,
      y: prevNode.y + dy,
      op: type
    };

    setCurrentChord(normalize(newNotes));
    setHistory([...history, newNode]);
    setEdges([...edges, { from: prevNode, to: newNode, type }]);
    setViewBox(prev => ({ ...prev, x: newNode.x - 150, y: newNode.y - 150 }));
    
    setTimeout(() => {
      if (pathRef.current) pathRef.current.scrollLeft = pathRef.current.scrollWidth;
    }, 10);
  };

  const resetTonnetz = () => {
    setCurrentChord([0, 4, 7]);
    setHistory([{ notes: [0, 4, 7], id: 'start', x: 0, y: 0, label: 'C Major', op: 'Start', type: 'Major' }]);
    setEdges([]);
    setViewBox({ x: -150, y: -150, w: 300, h: 300 });
  };

  const handleProgressionConvert = () => {
    const chords = progInput.split(/[\s,]+/).filter(s => s.trim().length > 0);
    const result = chords.map(str => {
      const notes = parseChordString(str);
      if (!notes) return { original: str, notes: [], negNotes: [], negLabel: '?' };
      const negNotes = getNegativeChord(notes, negKey);
      const negInfo = identifyChord(negNotes);
      return { original: str, notes, negNotes, negLabel: negInfo.label };
    });
    setProgOutput(result);
    setCompactOutput(result.map(r => r.negLabel).join("  "));
  };

  const handlePianoClick = (note) => {
    const negNote = getNegativeNote(note, negKey);
    setMelodyHistory(prev => [...prev.slice(-9), { input: note, output: negNote }]);
  };

  useEffect(() => {
    if (mode !== 'negative') return;
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
      pressedKeysRef.current.add(e.key);
      const key = e.key.toLowerCase();
      const baseMap = { 'c': 0, 'd': 2, 'e': 4, 'f': 5, 'g': 7, 'a': 9, 'b': 11 };
      if (baseMap.hasOwnProperty(key)) {
        let note = baseMap[key];
        if (e.shiftKey) note += 12; 
        if (pressedKeysRef.current.has(',') || pressedKeysRef.current.has('<')) note += 1; 
        if (pressedKeysRef.current.has('.') || pressedKeysRef.current.has('>')) note -= 1; 
        handlePianoClick(note);
      }
    };
    const handleKeyUp = (e) => pressedKeysRef.current.delete(e.key);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [mode, negKey]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans flex flex-col overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Top Navigation Bar */}
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/50 px-4 h-14 flex items-center justify-between z-50">
        <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <Sigma className="text-emerald-500" size={20} />
          <span className="hidden md:inline">Neo-Riemannian Explorer</span>
        </div>
        <Tabs value={mode} onValueChange={setMode} className="w-[300px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tonnetz">Tonnetz</TabsTrigger>
            <TabsTrigger value="negative">Negative Harmony</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="w-6 md:w-20"></div> {/* Spacer for centering */}
      </header>

      <main className="flex flex-1 overflow-hidden">
        
        {/* ================= MODE: TONNETZ EXPLORER ================= */}
        {mode === 'tonnetz' && (
          <div className="flex flex-1 flex-col md:flex-row w-full">
            
            {/* Sidebar Controls */}
            <div className="w-full md:w-80 lg:w-96 border-r border-zinc-800 bg-zinc-950 p-4 overflow-y-auto flex flex-col gap-6 z-20 shadow-xl">
              
              <Card className="border-blue-900/30 bg-blue-950/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-400 uppercase tracking-wider flex items-center gap-2">
                    <Music size={14} /> Current Chord
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-zinc-50 mb-4 tracking-tight">{chordInfo.label}</div>
                  <div className="flex flex-wrap gap-2">
                    {normalize(currentChord).map((note, i) => (
                      <div key={i} className="w-10 h-10 rounded-md bg-blue-600 flex items-center justify-center text-sm font-bold shadow-lg border border-blue-500/50 ring-2 ring-blue-900/20">
                        {NOTES[note]}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-3 gap-3">
                <Button onClick={() => handleTransform('P')} variant="outline" className="h-24 flex-col gap-2 hover:border-indigo-500/50 hover:bg-indigo-950/30 transition-all">
                  <span className="text-2xl font-bold text-indigo-400">P</span>
                  <span className="text-[10px] text-zinc-500 uppercase">Parallel</span>
                </Button>
                <Button onClick={() => handleTransform('L')} variant="outline" className="h-24 flex-col gap-2 hover:border-emerald-500/50 hover:bg-emerald-950/30 transition-all">
                  <span className="text-2xl font-bold text-emerald-400">L</span>
                  <span className="text-[10px] text-zinc-500 uppercase">Leading</span>
                </Button>
                <Button onClick={() => handleTransform('R')} variant="outline" className="h-24 flex-col gap-2 hover:border-rose-500/50 hover:bg-rose-950/30 transition-all">
                  <span className="text-2xl font-bold text-rose-400">R</span>
                  <span className="text-[10px] text-zinc-500 uppercase">Relative</span>
                </Button>
              </div>

              <div className="flex-1 min-h-[150px] flex flex-col">
                 <div className="flex items-center justify-between mb-2 px-1">
                   <h3 className="text-xs font-semibold text-zinc-500 uppercase flex items-center gap-2">
                     <History size={12} /> Traversal Path
                   </h3>
                   <Button variant="ghost" size="sm" onClick={resetTonnetz} className="h-6 text-xs px-2 text-zinc-500 hover:text-red-400">
                      <Trash2 size={12} className="mr-1"/> Clear
                   </Button>
                 </div>
                 
                 <div 
                    ref={pathRef}
                    className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 overflow-x-auto flex items-center gap-3 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"
                 >
                    {history.map((step, i) => (
                      <React.Fragment key={step.id}>
                         {i > 0 && (
                           <div className="flex flex-col items-center min-w-[20px]">
                              <span className="text-[9px] font-mono text-zinc-600 mb-0.5">{step.op}</span>
                              <ArrowRight size={12} className="text-zinc-700" />
                           </div>
                         )}
                         <Badge 
                          variant={i === history.length - 1 ? "default" : "secondary"}
                          className={`
                            flex flex-col items-center justify-center h-[50px] min-w-[60px] py-1 px-2
                            ${i === history.length - 1 ? 'ring-2 ring-zinc-500 ring-offset-2 ring-offset-zinc-950' : 'opacity-70'}
                          `}
                         >
                           <span className="text-[10px] font-normal opacity-70">{step.type.slice(0,3)}</span>
                           <span className="text-sm font-bold">{step.label.split(' ')[0]}</span>
                         </Badge>
                      </React.Fragment>
                    ))}
                 </div>
              </div>
            </div>

            {/* Visualization Canvas */}
            <div className="flex-1 relative bg-zinc-950 cursor-move overflow-hidden">
               <div className="absolute top-4 left-4 z-10">
                 <Badge variant="secondary" className="bg-zinc-900/80 backdrop-blur text-zinc-500 border-zinc-800">
                    Pan & Zoom Disabled (Demo)
                 </Badge>
               </div>
               <svg viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`} className="w-full h-full opacity-100 transition-opacity duration-700">
                 <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#27272a" strokeWidth="1"/>
                    </pattern>
                 </defs>
                 <rect x={viewBox.x} y={viewBox.y} width={viewBox.w} height={viewBox.h} fill="url(#grid)" />
                 
                 {edges.map((edge, i) => (
                   <g key={i}>
                      <line x1={edge.from.x} y1={edge.from.y} x2={edge.to.x} y2={edge.to.y} stroke="#52525b" strokeWidth="2" strokeDasharray="4 4" />
                   </g>
                 ))}
                 
                 {history.map((node, i) => {
                   const isLast = i === history.length - 1;
                   return (
                     <g key={node.id} className="transition-all duration-500">
                       <circle 
                          cx={node.x} cy={node.y} r={isLast ? 14 : 6} 
                          fill={node.type === 'Major' ? '#4f46e5' : '#be123c'} 
                          stroke={isLast ? '#fff' : 'none'} strokeWidth="2"
                          className="drop-shadow-lg"
                       />
                       {isLast && (
                         <g>
                           <rect x={node.x - 24} y={node.y + 20} width="48" height="16" rx="4" fill="#09090b" stroke="#27272a" />
                           <text x={node.x} y={node.y + 31} textAnchor="middle" fill="#e4e4e7" fontSize="8" className="font-bold uppercase tracking-wider">
                             {node.label}
                           </text>
                         </g>
                       )}
                     </g>
                   );
                 })}
               </svg>
            </div>
          </div>
        )}

        {/* ================= MODE: NEGATIVE HARMONY ================= */}
        {mode === 'negative' && (
          <div className="flex-1 flex flex-col md:flex-row w-full">
            
            {/* Configuration Panel */}
            <div className="w-full md:w-[400px] bg-zinc-950 border-r border-zinc-800 p-6 overflow-y-auto">
               <div className="space-y-8">
                 
                 <div>
                   <h3 className="text-sm font-medium text-zinc-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                     <Calculator size={14}/> Key Center (Axis)
                   </h3>
                   <div className="grid grid-cols-6 gap-2">
                     {NOTES.map((n, i) => (
                       <button 
                        key={n} 
                        onClick={() => setNegKey(i)}
                        className={cn(
                          "h-9 rounded-md text-xs font-bold border transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
                          negKey === i 
                            ? "bg-emerald-600 border-emerald-500 text-white shadow-[0_0_15px_rgba(5,150,105,0.4)]" 
                            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                        )}
                       >
                         {n}
                       </button>
                     ))}
                   </div>
                 </div>

                 <Separator />

                 <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Progression</h3>
                      <Badge variant="secondary" className="text-[10px] h-5">Ext. Chords Supported</Badge>
                   </div>
                   <Textarea 
                     value={progInput}
                     onChange={(e) => setProgInput(e.target.value)}
                     placeholder="e.g., Cmaj7 Am9 Dm7 G7"
                     className="font-mono text-base bg-zinc-900/50 border-zinc-800 focus:border-emerald-500/50"
                     rows="3"
                   />
                   <Button onClick={handleProgressionConvert} variant="accent" className="w-full font-semibold shadow-emerald-900/20">
                     <RefreshCcw className="mr-2 h-4 w-4" /> Convert Progression
                   </Button>
                 </div>

                 {progOutput.length > 0 && (
                   <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <Card className="bg-emerald-950/10 border-emerald-900/30">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Compact Output</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                           <div className="font-mono text-emerald-400 text-lg font-bold leading-relaxed break-words">
                              {compactOutput}
                           </div>
                        </CardContent>
                      </Card>

                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
                        {progOutput.map((item, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-colors">
                             <div className="w-1/3">
                               <span className="block text-[10px] text-zinc-500 uppercase font-semibold">In</span>
                               <span className="font-bold text-zinc-300">{item.original}</span>
                             </div>
                             <ArrowRight size={14} className="text-zinc-700" />
                             <div className="w-1/3 text-right">
                               <span className="block text-[10px] text-zinc-500 uppercase font-semibold">Out</span>
                               <span className="font-bold text-emerald-400">{item.negLabel}</span>
                             </div>
                          </div>
                        ))}
                      </div>
                   </div>
                 )}
               </div>
            </div>

            {/* Piano & Melody Area */}
            <div className="flex-1 bg-zinc-950 p-8 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/10 via-zinc-950 to-zinc-950 pointer-events-none" />
              
              <div className="max-w-3xl w-full space-y-8 relative z-10">
                
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-zinc-100 flex items-center gap-3">
                      <PianoIcon className="text-emerald-500" size={32} /> 
                      Melody Mirror
                    </h2>
                    <p className="text-zinc-500 mt-1">Play notes to visualize their negative reflection.</p>
                  </div>
                  <Badge variant="outline" className="hidden md:flex py-2 px-4 gap-4 bg-zinc-900/80 text-zinc-400 border-zinc-800 backdrop-blur">
                     <div className="flex items-center gap-1.5"><span className="bg-zinc-800 border border-zinc-700 rounded px-1.5 text-zinc-200 font-mono text-xs">Shift</span> Octave</div>
                     <Separator className="h-4 w-px my-0 bg-zinc-700" />
                     <div className="flex items-center gap-1.5"><span className="bg-zinc-800 border border-zinc-700 rounded px-1.5 text-zinc-200 font-mono text-xs">,</span> #</div>
                     <div className="flex items-center gap-1.5"><span className="bg-zinc-800 border border-zinc-700 rounded px-1.5 text-zinc-200 font-mono text-xs">.</span> b</div>
                  </Badge>
                </div>

                {/* The Mirror Visualization */}
                <Card className="bg-zinc-900/30 border-zinc-800">
                  <CardContent className="p-10 flex items-center justify-center gap-16">
                     {/* Input */}
                     <div className="flex flex-col items-center gap-4">
                        <div className={cn(
                          "w-32 h-32 rounded-2xl flex items-center justify-center text-5xl font-bold shadow-2xl transition-all duration-200 border-4",
                          melodyHistory.length ? 'bg-blue-500/10 text-blue-400 border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.2)]' : 'bg-zinc-900 text-zinc-700 border-zinc-800'
                        )}>
                          {melodyHistory.length ? getNoteLabel(melodyHistory[melodyHistory.length-1].input) : ''}
                        </div>
                        <span className="text-xs uppercase tracking-widest text-blue-500 font-bold">Input</span>
                     </div>

                     <div className="h-32 w-px bg-gradient-to-b from-transparent via-zinc-700 to-transparent dashed opacity-50" />

                     {/* Output */}
                     <div className="flex flex-col items-center gap-4">
                        <div className={cn(
                          "w-32 h-32 rounded-2xl flex items-center justify-center text-5xl font-bold shadow-2xl transition-all duration-200 border-4",
                          melodyHistory.length ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'bg-zinc-900 text-zinc-700 border-zinc-800'
                        )}>
                          {melodyHistory.length ? getNoteLabel(melodyHistory[melodyHistory.length-1].output) : ''}
                        </div>
                        <span className="text-xs uppercase tracking-widest text-emerald-500 font-bold">Reflection</span>
                     </div>
                  </CardContent>
                </Card>

                {/* Interactive Piano */}
                <div className="flex justify-center select-none pb-6">
                  {KEYBOARD_KEYS.map((k, i) => {
                    const lastEntry = melodyHistory[melodyHistory.length - 1];
                    let isInput = false;
                    let isOutput = false;
                    if (lastEntry) {
                      if (mod(lastEntry.input) === mod(k.note)) isInput = true;
                      if (mod(lastEntry.output) === mod(k.note)) isOutput = true;
                    }

                    return (
                      <div 
                        key={i}
                        onClick={() => handlePianoClick(k.note)}
                        className={cn(
                          "relative rounded-b-md transition-all duration-100 cursor-pointer user-select-none",
                          k.type === 'white' 
                            ? "w-12 h-40 -mx-[2px] z-0 bg-zinc-100 border-b-4 border-zinc-300 active:bg-zinc-200 active:h-[9.8rem]" 
                            : "w-8 h-24 -mx-[16px] z-10 bg-zinc-900 border-b-4 border-black active:bg-zinc-800 active:h-[5.8rem]",
                          isInput && "!bg-blue-500 !border-blue-700 mt-1 shadow-[inset_0_-5px_10px_rgba(0,0,0,0.3)]",
                          isOutput && !isInput && "!bg-emerald-500 !border-emerald-700 mt-1 shadow-[inset_0_-5px_10px_rgba(0,0,0,0.3)]",
                          isOutput && isInput && "!bg-indigo-500 !border-indigo-700",
                          "first:rounded-bl-lg last:rounded-br-lg"
                        )}
                      >
                         <div className={cn(
                           "absolute bottom-3 left-0 right-0 text-center text-[10px] font-bold",
                           k.type === 'white' && !isInput && !isOutput ? 'text-zinc-400' : 'text-white/90 opacity-0'
                         )}>
                           {k.label}
                         </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;