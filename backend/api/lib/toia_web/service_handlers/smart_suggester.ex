defmodule ServiceHandlers.SmartSuggester do
  use HTTPoison.Base

  alias Toia.Streams

  @expected_fields ~w(suggestions)

  def process_request_url(_url) do
    System.get_env("SMART_SUGGESTER_ROUTE")
  end

  def process_request_headers(_headers) do
    [{"Content-Type", "application/json"}]
  end

  def process_request_options(_options) do
    [timeout: 100_000, recv_timeout: 100_000]
  end

  def process_request_body(body) do
    stream_id = body["stream_id"]
    stream = Streams.get_stream!(stream_id)

    payload = %{
      new_q: body["latest_question"],
      new_a: body["latest_answer"],
      n_suggestions: 5,
      avatar_id: stream.toia_id,
      stream_id: stream_id
    }

    Poison.encode!(payload)
  end

  def process_response_body(body) do
    body =
      body
      |> Poison.decode!()
      |> Map.take(@expected_fields)
    questions = body["suggestions"] |> Poison.decode!()
    Enum.map(questions, fn q -> %{question: q} end)
  end
end
