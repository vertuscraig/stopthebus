// Deal with Score and Answers Below
const pointsInputs = Array.from(document.querySelectorAll(".sheet-points"));

export function handleStopTheBus(gameData, localPlayer, remotePlayers) {
  const answerInputs = Array.from(
    document.querySelectorAll(".sheet-answers-local")
  );

  const answers = answerInputs.map((answer) => {
    return answer.value;
  });
  localPlayer[0].answers = answers;
  console.log(localPlayer[0]);
}
