import { ArrowRight } from "phosphor-react";
import PropTypes from "prop-types";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAnswers } from "../store/actions";
import { parseHTML, shuffle } from "../utils";
import AnswerButton from "./AnswerButton";
import Timer from "./Timer";

const ANSWER_TIMEOUT = 30000;

const DIFFICULTY_PALETTE = {
  easy: "text-success",
  medium: "text-warning",
  hard: "text-error",
};

const FINAL_INDEX = 9;

export function Question(props) {
  const {
    category,
    question,
    correct_answer: correctAnswer,
    incorrect_answers: incorrectAnswers,
    difficulty,
    nextQuestion,
    goToFeedback,
    index,
  } = props;

  const [answered, setAnswered] = useState();

  const dispatch = useDispatch();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!answered) {
        setAnswered("Timed out!");
      }
    }, ANSWER_TIMEOUT);
    if (answered) clearTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [answered]);

  const parsedQuestion = useMemo(() => parseHTML(question), [question]);

  const allAnswers = useSelector(state => state.player.answers);

  const parsedCorrectAnswer = useMemo(
    () => parseHTML(correctAnswer),
    [correctAnswer]
  );

  const answers = useMemo(
    () => shuffle([...incorrectAnswers, correctAnswer].map(parseHTML)),
    [incorrectAnswers, parsedCorrectAnswer, shuffle]
  );

  const difficultyColor = DIFFICULTY_PALETTE[difficulty];

  const buttonMessage = useMemo(() => {
    if (!answered) return "";
    if (index === FINAL_INDEX) return "Results";
    if (answered === "Timed out!") return "Timed out, hurry up!";
    if (answered.split(" | ")[0] === parsedCorrectAnswer) return "You got it, keep it up!";
    return "You got it wrong, try again!";
  }, [answered]);

  const buttonStyle = useMemo(() => {
    if (!answered) return "";
    if (index === FINAL_INDEX)
      return "bg-gradient-to-r text-white overflow-hidden from-lime-500 to-green-500";
    if (answered === "Timed out!") return "bg-purple-500 text-white";
    if (answered.split(" | ")[0] === parsedCorrectAnswer) return "bg-green-500 text-white";
    return "bg-red-500 text-white";
  }, [answered]);

  return (
    <div>
      <h1 className="text-2xl mt-4 leading-tight mb-2">{parsedQuestion}</h1>
      <div className="flex gap-4 mb-2 uppercase justify-between">
        <p className="font-medium opacity-75">
          Question {index + 1}/{FINAL_INDEX + 1} · {category}
        </p>
        <p className={difficultyColor + " font-medium"}>
          {difficulty}
        </p>
      </div>
      <div className="flex flex-col items-stretch justify-around h-96">
        {answers.map(answer => (
          <AnswerButton
            clicked={Boolean(answered)}
            disabled={Boolean(answered)}
            key={answer}
            body={answer}
            setAnswered={setAnswered}
            isCorrect={answer ===parsedCorrectAnswer}
            difficulty={difficulty}
          />
        ))}
      </div>

      <div className="flex flex-col mt-2 justify-center items-stretch">
        {!answered && <Timer answered={answered} />}

        {answered && (
          <button
            type="button"
            className={`${buttonStyle} h-20 rounded-lg flex justify-between gap-2 items-center px-5 font-bold text-lg tracking-wide`}
            onClick={() => {
              dispatch(setAnswers([...allAnswers, answered]));
              if (index === FINAL_INDEX) return goToFeedback();
              nextQuestion();
            }}
          >
            <span>{buttonMessage}</span>

            <ArrowRight size="24px" weight="bold" />
          </button>
        )}
      </div>
    </div>
  );
}

Question.propTypes = {
  correct_answer: PropTypes.string.isRequired,
  incorrect_answers: PropTypes.arrayOf(PropTypes.string).isRequired,
  question: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  difficulty: PropTypes.string.isRequired,
  nextQuestion: PropTypes.func.isRequired,
  goToFeedback: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
};

export default Question;
