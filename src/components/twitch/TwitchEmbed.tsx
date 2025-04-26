
import React from 'react';

interface TwitchEmbedProps {
  channel: string;
  height?: string;
  width?: string;
}

export function TwitchEmbed({ channel, height = "480px", width = "100%" }: TwitchEmbedProps) {
  return (
    <div className="relative w-full" style={{ height }}>
      <iframe
        src={`https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}&muted=true`}
        height="100%"
        width={width}
        allowFullScreen
        className="rounded-lg"
      />
    </div>
  );
}
