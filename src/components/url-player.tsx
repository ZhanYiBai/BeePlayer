import ReactPlayer from "react-player";
import { useRef, useState, useCallback, FC } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Image } from "@heroui/image";
import { Progress } from "@heroui/progress";
import { Select, SelectItem } from "@heroui/select";
import { clsx } from "@heroui/shared-utils";
import Duration from "./duration";
import {
  PauseCircleBoldIcon,
  PlayCircleBoldIcon,
  StopBoldIcon,
  RepeatOneBoldIcon,
  VolumeUpBoldIcon,
  VolumeOffBoldIcon,
  HeartLinearIcon,
} from "./icons";

interface UrlPlayerProps {
  className?: string;
  defaultUrl?: string;
}

// Preset video URLs
const presetVideos = [
  {
    key: "热带雨林",
    label: "热带雨林白噪音",
    url: "https://www.youtube.com/watch?v=kHr4yag0fqA",
  },
];

export const UrlPlayer: FC<UrlPlayerProps> = ({
  className,
  defaultUrl = "",
}) => {
  const playerRef = useRef<HTMLVideoElement | null>(null);
  const urlInputRef = useRef<HTMLInputElement | null>(null);

  const initialState = {
    src: defaultUrl,
    pip: false,
    playing: false,
    controls: false,
    light: false,
    volume: 1,
    muted: false,
    played: 0,
    loaded: 0,
    duration: 0,
    playbackRate: 1.0,
    loop: false,
    seeking: false,
    loadedSeconds: 0,
    playedSeconds: 0,
  };

  type PlayerState = Omit<typeof initialState, "src"> & {
    src?: string;
  };

  const [state, setState] = useState<PlayerState>(initialState);
  const [url, setUrl] = useState(defaultUrl);
  const [liked, setLiked] = useState(false);

  const handlePlayPause = () => {
    setState((prevState) => ({ ...prevState, playing: !prevState.playing }));
  };

  const handleStop = () => {
    setState((prevState) => ({ ...prevState, src: undefined, playing: false }));
  };

  const handleToggleMuted = () => {
    setState((prevState) => ({ ...prevState, muted: !prevState.muted }));
  };

  const handleToggleLoop = () => {
    setState((prevState) => ({ ...prevState, loop: !prevState.loop }));
  };

  const handleProgress = () => {
    const player = playerRef.current;
    if (!player || state.seeking || !player.buffered?.length) return;

    setState((prevState) => ({
      ...prevState,
      loadedSeconds: player.buffered?.end(player.buffered?.length - 1),
      loaded:
        player.buffered?.end(player.buffered?.length - 1) / player.duration,
    }));
  };

  const handleTimeUpdate = () => {
    const player = playerRef.current;
    if (!player || state.seeking) return;

    if (!player.duration) return;

    setState((prevState) => ({
      ...prevState,
      playedSeconds: player.currentTime,
      played: player.currentTime / player.duration,
    }));
  };

  const handleEnded = () => {
    setState((prevState) => ({ ...prevState, playing: prevState.loop }));
  };

  const handleDurationChange = () => {
    const player = playerRef.current;
    if (!player) return;

    setState((prevState) => ({ ...prevState, duration: player.duration }));
  };

  const handleLoadCustomUrl = () => {
    if (url.trim()) {
      setState((prevState) => ({
        ...prevState,
        src: url,
      }));
    }
  };

  const handlePresetSelect = (selectedKey: string) => {
    const selectedVideo = presetVideos.find(
      (video) => video.key === selectedKey
    );
    if (selectedVideo) {
      setUrl(selectedVideo.url);
      setState((prevState) => ({
        ...prevState,
        src: selectedVideo.url,
      }));
    }
  };

  const setPlayerRef = useCallback((player: HTMLVideoElement) => {
    if (!player) return;
    playerRef.current = player;
  }, []);

  const { src, playing, volume, muted, loop, played, duration } = state;

  return (
    <Card
      isBlurred
      className={clsx(
        "border-none bg-background/60 dark:bg-default-100/50",
        className
      )}
      shadow="sm"
    >
      <CardBody>
        <div className="grid grid-cols-6 md:grid-cols-12 gap-6 md:gap-4 items-center justify-center">
          <div className="relative col-span-6 md:col-span-4">
            {src ? (
              <Card>
                <CardBody className="aspect-video p-0 overflow-hidden">
                  <ReactPlayer
                    ref={setPlayerRef}
                    src={src}
                    playing={playing}
                    controls={false}
                    loop={loop}
                    volume={volume}
                    muted={muted}
                    config={{
                      youtube: {
                        color: "white",
                      },
                      vimeo: {
                        color: "ffffff",
                      },
                    }}
                    onPlay={() =>
                      setState((prevState) => ({ ...prevState, playing: true }))
                    }
                    onPause={() =>
                      setState((prevState) => ({
                        ...prevState,
                        playing: false,
                      }))
                    }
                    onEnded={handleEnded}
                    onTimeUpdate={handleTimeUpdate}
                    onProgress={handleProgress}
                    onDurationChange={handleDurationChange}
                  />
                </CardBody>
              </Card>
            ) : (
              <Card>
                <CardBody className="p-0 overflow-hidden">
                  <Image
                    alt="Video placeholder"
                    className="object-cover shadow-black/20"
                    height={200}
                    shadow="lg"
                    src="https://heroui.com/images/album-cover.png"
                    width="100%"
                  />
                </CardBody>
              </Card>
            )}
          </div>

          <div className="flex flex-col col-span-6 md:col-span-8">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-foreground/90">URL Player</h3>
              <Button
                isIconOnly
                className="text-default-900/60 data-hover:bg-foreground/10 translate-x-2"
                radius="full"
                variant="light"
                onPress={() => setLiked((v) => !v)}
              >
                <HeartLinearIcon
                  className={liked ? "[&>path]:stroke-transparent" : ""}
                  fill={liked ? "currentColor" : "none"}
                />
              </Button>
            </div>

            {/* URL Input */}
            <div className="flex flex-col gap-2 mt-3">
              <div className="flex gap-2">
                <input
                  ref={urlInputRef}
                  type="text"
                  placeholder="Enter video URL (YouTube, Vimeo, MP4, etc.)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 px-3 py-2 bg-default-100 rounded-lg border border-default-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button
                  color="primary"
                  onPress={handleLoadCustomUrl}
                  isDisabled={!url.trim()}
                >
                  Load
                </Button>
              </div>
            </div>

            <div className="flex flex-col mt-3 gap-1">
              <Progress
                aria-label="Video progress"
                classNames={{
                  indicator: "bg-default-800 dark:bg-white",
                  track: "bg-default-500/30",
                }}
                color="default"
                size="sm"
                value={played * 100}
              />
              <div className="flex justify-between">
                <p className="text-sm">
                  <Duration seconds={duration * played} />
                </p>
                <p className="text-sm text-foreground/50">
                  <Duration seconds={duration} />
                </p>
              </div>
            </div>

            <div className="flex w-full items-center">
              {/* Preset Video Selector - Left */}
              <div className="flex-1">
                <Select
                  placeholder="选择音乐"
                  className="w-36 text-sm"
                  size="sm"
                  onSelectionChange={(keys: any) => {
                    const selectedKey = Array.from(keys)[0] as string;
                    if (selectedKey) {
                      handlePresetSelect(selectedKey);
                    }
                  }}
                >
                  {presetVideos.map((video) => (
                    <SelectItem key={video.key} className="text-sm">
                      {video.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {/* Control Buttons - Center */}
              <div className="flex items-center gap-2">
                <Button
                  isIconOnly
                  className="data-hover:bg-foreground/10"
                  radius="full"
                  variant="light"
                  onPress={handleToggleLoop}
                  color={loop ? "primary" : "default"}
                >
                  <RepeatOneBoldIcon className="text-foreground/80" />
                </Button>
                <Button
                  isIconOnly
                  className="data-hover:bg-foreground/10"
                  radius="full"
                  variant="light"
                  onPress={handleStop}
                  isDisabled={!src}
                >
                  <StopBoldIcon />
                </Button>
                <Button
                  isIconOnly
                  className="w-auto h-auto data-hover:bg-foreground/10"
                  radius="full"
                  variant="light"
                  onPress={handlePlayPause}
                  isDisabled={!src}
                >
                  {playing ? (
                    <PauseCircleBoldIcon size={54} />
                  ) : (
                    <PlayCircleBoldIcon size={54} />
                  )}
                </Button>
                <Button
                  isIconOnly
                  className="data-hover:bg-foreground/10"
                  radius="full"
                  variant="light"
                  onPress={handleToggleMuted}
                  color={muted ? "warning" : "default"}
                >
                  {muted ? (
                    <VolumeOffBoldIcon className="text-foreground/80" />
                  ) : (
                    <VolumeUpBoldIcon className="text-foreground/80" />
                  )}
                </Button>
              </div>

              {/* Right side - Empty for now */}
              <div className="flex-1"></div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default UrlPlayer;
