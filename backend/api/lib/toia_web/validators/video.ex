defmodule ToiaWeb.VideoValidator do
  alias Toia.ToiaUsers

  def validateAnswerParam(answer) do
    if String.last(answer) != "." && String.last(answer) != "?" && String.last(answer) != "!" do
      answer = answer <> "."
      {:ok, answer}
    else
      {:ok, answer}
    end
  end

  @questions_param %{
    questions: [
      type:
        {:array,
         %{
           id_question: [type: :integer],
           question: [type: :string, required: true]
         }},
      required: true
    ]
  }
  def validateQuestionsParam(questions) do
    with {:ok, questions} <- Poison.decode(questions),
         {:ok, questions} <- Tarams.cast(%{questions: questions}, @questions_param) do
      {:ok, questions.questions}
    else
      {:error, _} ->
        {:error, "Invalid questions", "Invalid questions"}
    end
  end

  def validateVideoTypeParam(videoType) do
    possibleType = ~w[filler greeting answer exit no-answer y/n-answer]

    if Enum.member?(possibleType, videoType) do
      {:ok, String.to_existing_atom(videoType)}
    else
      {:error, "Invalid video type", "Invalid video type"}
    end
  end

  def validateStreamsList(streams, user_id) do
    case Enum.all?(streams, fn stream_id ->
           ToiaUsers.owns_stream(user_id, stream_id)
         end) do
      true ->
        {:ok, streams}

      false ->
        {:error, "Invalid streams or user isn't the owner",
         "Invalid streams or user isn't the owner"}
    end
  end
end
