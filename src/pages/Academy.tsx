import { useState } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, Trophy, Star, Rocket, BookOpen, AlertTriangle, Play } from 'lucide-react';
import type { Mission, TestCase } from '@/engine/types';
import { missions } from '@/data/missions';
import { useSimulatorStore } from '@/stores/simulatorStore';
import { useUIStore } from '@/stores/uiStore';
import { TuringExecutor } from '@/engine/executor';
import { machineLibrary } from '@/data/machines';

export function Academy() {
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [testResults, setTestResults] = useState<{ input: string; expected: string; actual: string; passed: boolean }[] | null>(null);
  const [running, setRunning] = useState(false);
  const loadMachine = useSimulatorStore((state) => state.loadMachine);
  const setWorld = useUIStore((state) => state.setWorld);

  function enterMission(mission: Mission) {
    setSelectedMission(mission);
    setTestResults(null);
    if (mission.starterMachine) {
      loadMachine(mission.starterMachine);
    }
  }

  function runTests() {
    if (!selectedMission || selectedMission.testCases.length === 0) return;
    setRunning(true);
    const machine = useSimulatorStore.getState().machine;
    const results = selectedMission.testCases.map((testCase: TestCase) => {
      const executor = new TuringExecutor(machine, testCase.input);
      const result = executor.run();
      const actual = result.status === 'accepted' ? 'accept' : 'reject';
      return {
        input: testCase.input || 'ε',
        expected: testCase.expected,
        actual,
        passed: actual === testCase.expected,
      };
    });
    setTestResults(results);
    setRunning(false);
  }

  function backToMissions() {
    setSelectedMission(null);
    setTestResults(null);
  }

  function launchSimulator() {
    setWorld('command-deck');
  }

  if (selectedMission) {
    const passedCount = testResults?.filter((r) => r.passed).length ?? 0;
    const totalCount = testResults?.length ?? 0;
    const allPassed = totalCount > 0 && passedCount === totalCount;

    return (
      <div className="academy-mission">
        <button className="secondary-button mb-4" onClick={backToMissions}><ArrowLeft size={14} /> BACK TO MISSIONS</button>
        <div className="mission-header">
          <div>
            <div className="eyebrow">MISSION {selectedMission.id.replace('mission-', '')}</div>
            <h2 className="display-title text-4xl">{selectedMission.title}</h2>
            <p className="mt-2 text-sm text-slate-400">{selectedMission.subtitle}</p>
          </div>
          <div className="mission-difficulty">
            {Array.from({ length: 5 }, (_, i) => (
              <Star key={i} size={16} className={i < selectedMission.difficulty ? 'text-amber-400' : 'text-slate-700'} fill={i < selectedMission.difficulty ? 'currentColor' : 'none'} />
            ))}
          </div>
        </div>

        <div className="panel mt-6">
          <div className="panel-heading mb-3"><span className="text-cyan-200">BRIEFING</span><span /></div>
          <p className="text-sm leading-6 text-slate-300">{selectedMission.description}</p>
          <div className="mt-4 rounded-lg border border-cyan-500/20 bg-cyan-500/[0.05] p-4">
            <div className="mb-1 text-[10px] font-bold tracking-widest text-cyan-300">LANGUAGE</div>
            <div className="font-mono text-sm text-cyan-100">{selectedMission.language}</div>
            <div className="mt-1 text-xs text-slate-400">{selectedMission.languageDescription}</div>
          </div>
        </div>

        {selectedMission.testCases.length > 0 ? (
          <div className="panel mt-4">
            <div className="panel-heading mb-3"><span className="text-cyan-200">TEST SUITE ({selectedMission.testCases.length} CASES)</span>
              <span>{testResults ? `${passedCount}/${totalCount} PASSED` : 'NOT RUN'}</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {testResults ? testResults.map((result, i) => (
                <div key={i} className={`test-result ${result.passed ? 'test-pass' : 'test-fail'}`}>
                  {result.passed ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                  <span className="font-mono text-xs">{result.input}</span>
                  <span className="text-slate-500 text-[10px]">expected: {result.expected}</span>
                  <span className="text-[10px]">got: {result.actual}</span>
                </div>
              )) : selectedMission.testCases.map((testCase, i) => (
                <div key={i} className="test-case-row">
                  <span className="font-mono text-xs">{testCase.input || 'ε'}</span>
                  <span className={testCase.expected === 'accept' ? 'text-emerald-400' : 'text-rose-400'}>{testCase.expected.toUpperCase()}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <button className="primary-button" onClick={runTests} disabled={running}>
                <Play size={14} fill="currentColor" /> {running ? 'RUNNING...' : 'RUN TEST SUITE'}
              </button>
              <button className="secondary-button" onClick={launchSimulator}>
                <Rocket size={14} /> OPEN IN COMMAND DECK
              </button>
            </div>
            {allPassed && (
              <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.08] p-4">
                <div className="flex items-center gap-2 text-emerald-300"><Trophy size={16} /><span className="font-bold">MISSION COMPLETE</span></div>
                <p className="mt-2 text-xs text-emerald-200/80">{selectedMission.solutionExplanation}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="panel mt-4">
            <div className="panel-heading mb-3"><span className="text-cyan-200">THE UNDECIDABLE</span><span /></div>
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/[0.08] p-4">
              <div className="flex items-center gap-2 text-rose-300"><AlertTriangle size={16} /><span className="font-bold">THIS MISSION CANNOT BE SOLVED</span></div>
              <p className="mt-2 text-xs leading-5 text-rose-200/80">{selectedMission.solutionExplanation}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="eyebrow"><BookOpen size={13} /> COMPUTATION ACADEMY</div>
        <h2 className="display-title text-4xl">Learn by building.<br /><span>Solve computational missions.</span></h2>
        <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">Each mission challenges you to build a Turing Machine that recognizes a specific language. Your machine is tested against a suite of inputs — pass them all to complete the mission.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {missions.map((mission) => (
          <button key={mission.id} className="mission-card" onClick={() => enterMission(mission)}>
            <div className="mission-card-header">
              <span className="mission-card-id">MISSION {mission.id.replace('mission-', '')}</span>
              <div className="mission-difficulty-sm">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} size={11} className={i < mission.difficulty ? 'text-amber-400' : 'text-slate-700'} fill={i < mission.difficulty ? 'currentColor' : 'none'} />
                ))}
              </div>
            </div>
            <h3 className="mission-card-title">{mission.title}</h3>
            <p className="mission-card-subtitle">{mission.subtitle}</p>
            <p className="mission-card-desc">{mission.description.slice(0, 100)}...</p>
            <div className="mission-card-footer">
              <span className="text-[10px] tracking-widest text-slate-500">{mission.testCases.length} TESTS</span>
              <span className="mission-card-enter">ENTER →</span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-10">
        <div className="eyebrow mb-4"><Rocket size={13} /> MACHINE LIBRARY</div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {machineLibrary.map((machine) => (
            <button key={machine.name} className="library-card" onClick={() => { loadMachine(machine); setWorld('command-deck'); }}>
              <span className="library-card-name">{machine.name}</span>
              <span className="library-card-meta">{machine.states.length} STATES / {machine.transitions.length} TRANSITIONS</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
