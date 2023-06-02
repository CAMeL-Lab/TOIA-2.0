defmodule Toia.VideosQuestionsStreams.VideoQuestionStream do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key false
  schema "videos_questions_streams" do
    field :ada_search, :string
    field :type, Ecto.Enum, values: [:filler, :greeting, :answer, :exit, :"no-answer", :"y/n-answer"]
    field :id_video, :string, primary_key: true
    field :id_question, :id, primary_key: true
    field :id_stream, :id, primary_key: true
  end

  @doc false
  def changeset(video_question_stream, attrs) do
    video_question_stream
    |> cast(attrs, [:type, :ada_search])
    |> validate_required([:type, :ada_search])
  end
end
