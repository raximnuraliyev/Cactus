import { useMemo } from "react";
import type { ScenarioTemplate } from "../types";

export function translateScenario(scenario: ScenarioTemplate, t: (key: string) => string): ScenarioTemplate {
  const sId = scenario.id;
  const tTitle = t(`scenarios.${sId}.title`);
  const tIntro = t(`scenarios.${sId}.character_intro`);
  const tBriefing = t(`scenarios.${sId}.briefing`);

  return {
    ...scenario,
    title: tTitle.startsWith("scenarios.") ? scenario.title : tTitle,
    characterIntro: tIntro.startsWith("scenarios.") ? scenario.characterIntro : tIntro,
    briefing: tBriefing.startsWith("scenarios.") ? scenario.briefing : tBriefing,
    stages: scenario.stages.map((stage, sIdx) => {
      const tQ = t(`scenarios.${sId}.stages.${sIdx}.question`);
      const tRespReal = t(`scenarios.${sId}.stages.${sIdx}.responses.isReal`);
      const tRespFake = t(`scenarios.${sId}.stages.${sIdx}.responses.isFake`);

      return {
        ...stage,
        question: tQ.startsWith("scenarios.") ? stage.question : tQ,
        choices: stage.choices.map((c, cIdx) => {
          const tC = t(`scenarios.${sId}.stages.${sIdx}.choices.${cIdx}`);
          return tC.startsWith("scenarios.") ? c : tC;
        }),
        responses: {
          ...stage.responses,
          isReal: tRespReal.startsWith("scenarios.") ? stage.responses.isReal : tRespReal,
          isFake: tRespFake.startsWith("scenarios.") ? stage.responses.isFake : tRespFake,
        },
      };
    }),
  };
}

export function useTranslatedScenario(scenario: ScenarioTemplate, t: (key: string) => string): ScenarioTemplate {
  return useMemo(() => translateScenario(scenario, t), [scenario, t]);
}
