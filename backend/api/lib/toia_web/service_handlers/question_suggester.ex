defmodule ServiceHandlers.QuestionSuggester do
  use HTTPoison.Base

  def process_request_url(_url) do
    System.get_env("Q_API_ROUTE")
  end

  def process_request_headers(_headers) do
    [{"Content-Type", "application/json"}]
  end

  def process_request_options(_options) do
    [timeout: 100_000, recv_timeout: 100_000]
  end

  def process_request_body(body) do
    payload = %{
      new_q: body["latest_question"],
      new_a: body["latest_answer"],
      n_suggestions: 3,
      avatar_id: body["toia_id"],
      callback_url: "http://host.docker.internal:4000/api/question_suggestions?toia_id=#{body["toia_id"]}"
    }

    Poison.encode!(payload)
  end
end
