import React from "react";
import { Composition } from "remotion";
import { QuickFitDemo, DURATION } from "./QuickFitDemo";

export const Root: React.FC = () => (
  <Composition id="QuickFitDemo" component={QuickFitDemo} durationInFrames={DURATION} fps={30} width={1920} height={1080} />
);
