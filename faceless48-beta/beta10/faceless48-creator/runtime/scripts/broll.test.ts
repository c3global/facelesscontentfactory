import {test} from 'node:test';
import assert from 'node:assert/strict';
import {graphicSchema} from '../src/schema';
test('broll cutaway fills in its defaults',()=>{const g:any=graphicSchema.parse({type:'broll',at:1,until:3,props:{src:'stock/a.mp4'}});assert.equal(g.props.move,'zoom');assert.equal(g.props.startSec,0);assert.equal(g.props.scrim,true);});
test('broll cutaway rejects unknown moves and out-of-range zoom',()=>{assert(!graphicSchema.safeParse({type:'broll',at:1,until:3,props:{src:'stock/a.mp4',move:'spin'}}).success);assert(!graphicSchema.safeParse({type:'broll',at:1,until:3,props:{src:'stock/a.mp4',zoom:3}}).success);assert(!graphicSchema.safeParse({type:'broll',at:1,until:3,props:{}}).success);});
