import type React from 'react';
import type {Cues} from './PileStage';
import {PileStage} from './PileStage';
import {RoleStage} from './RoleStage';
import {EquityStage} from './EquityStage';

/** Stage art by episode. The key is `stage` in content/<slug>.stick.json. */
export const STAGES: Record<string, React.FC<{t: number; q: Cues}>> = {
  'the-pile': PileStage,
  'role-relationship': RoleStage,
  'equity-theory': EquityStage,
};
