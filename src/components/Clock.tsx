import { Play, Pause, FastForward, RotateCcw } from 'lucide-react'

interface ClockProps {
    simTime: Date
    isPaused: boolean
    simSpeed: number
    setSimTime: (simTime: Date) => void
    setIsPaused: (isPaused: boolean) => void
    setSimSpeed: (simSpeed: number) => void
}

const speeds = [-1000, -500, -100, -10, -1, 1, 10, 100, 500, 1000]

const speedLength : number = speeds.length

function Clock({simTime, isPaused, simSpeed, setSimTime, setIsPaused, setSimSpeed}: ClockProps) {
    const utcString = simTime.toUTCString().replace('GMT', 'UTC')

    const color = '#60a5fa' // soft blue

    function handleClick() {
        isPaused ? setIsPaused(false) : setIsPaused(true)
    }

    function handleSpeedIncrease() {
        let currentIndex = speeds.indexOf(simSpeed)
        // If 100 speed do not increase else increase speed
        currentIndex === speedLength - 1 ? currentIndex = speedLength - 1 : currentIndex = currentIndex + 1
        setSimSpeed(speeds[currentIndex])
    }


    function handleSpeedDecrease() {
        let currentIndex = speeds.indexOf(simSpeed)
        // If -100 speed do not increase else increase speed
        currentIndex === 0 ? currentIndex = 0 : currentIndex = currentIndex - 1
        setSimSpeed(speeds[currentIndex])
    }

    function handleResetTime() {
        const realTime = new Date()
        setSimTime(realTime)
        // Resets SimSpeed back to 1x
        setSimSpeed(speeds[speedLength/2])
        // Starts up again
        setIsPaused(false)
    }


    return (
        <div className="bg-black/80 border border-white/10 rounded-xl px-3 py-0.5 inline-flex items-center gap-2">
            {/* Time display */}
            <span style={{ color: color }} className="font-mono text-sm">
                {utcString}
            </span>
            
            {/* Controls row */}
            <div className="flex items-center gap-1">
                <button onClick={handleSpeedDecrease} className="p-1.5 hover:bg-white/10 rounded">
                    <FastForward className="w-4 h-4 text-white/70 rotate-180" />
                </button>
                <button onClick={handleClick} className="p-1.5 hover:bg-white/10 rounded">
                    {isPaused ? <Play className="w-4 h-4 text-white/70" /> : <Pause className="w-4 h-4 text-white/70" />}
                </button>
                <button onClick={handleSpeedIncrease} className="p-1.5 hover:bg-white/10 rounded">
                    <FastForward className="w-4 h-4 text-white/70" />
                </button>
                <button onClick={handleResetTime} className="p-1.5 hover:bg-white/10 rounded">
                    <RotateCcw className="w-4 h-4 text-white/70" />
                </button>
            </div>

            {/* Speed display */}
            <span className="text-white/70 text-xs font-mono w-8 text-center">
                {simSpeed}x
            </span>
        </div>
    )
}

export default Clock