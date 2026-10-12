import type React from 'react';
import type {Cues} from './PileStage';
import {PileStage} from './PileStage';
import {RoleStage} from './RoleStage';
import {EquityStage} from './EquityStage';
import {AgreementStage} from './AgreementStage';
import {ThawStage} from './ThawStage';
import {UsefulEasyStage} from './UsefulEasyStage';
import {OwnerStage} from './OwnerStage';
import {RedGreenStage} from './RedGreenStage';
import {FundedStage} from './FundedStage';
import {TrustGreenStage} from './TrustGreenStage';
import {TacitStage} from './TacitStage';
import {QuietStage} from './QuietStage';
import {AvoidStage} from './AvoidStage';

/** Stage art by episode. The key is `stage` in content/<slug>.stick.json. */
export const STAGES: Record<string, React.FC<{t: number; q: Cues}>> = {
  'the-pile': PileStage,
  'role-relationship': RoleStage,
  'equity-theory': EquityStage,
  'agreement': AgreementStage,
  'thaw': ThawStage,
  'useful-easy': UsefulEasyStage,
  'owner-after-launch': OwnerStage,
  'red-turns-green': RedGreenStage,
  'funded-for-seven': FundedStage,
  'trust-a-green': TrustGreenStage,
  'more-than-you-can-tell': TacitStage,
  'quick-or-quiet': QuietStage,
  'three-things-to-avoid': AvoidStage,
};
