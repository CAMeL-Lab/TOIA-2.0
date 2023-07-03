defmodule ServiceHandlers.DialogueManager do
  use HTTPoison.Base

  alias Toia.Streams

  @expected_fields ~w(answer id_video ada_similarity_score)

  def process_request_url(_url) do
    "http://localhost:5001/dialogue_manager"
  end

  def process_request_headers(_headers) do
    [{"Content-Type", "application/json"}]
  end

  def process_request_body(body) do
    query = body["query"]
    stream_id = body["stream_id"]
    stream = Streams.get_stream!(stream_id)

    payload = %{
      params: %{
        query: query,
        stream_id: to_string(stream_id),
        avatar_id: to_string(stream.toia_id)
      }
    }

    Poison.encode!(payload)
  end

  def process_response_body(body) do
    body
    |> Poison.decode!
    |> Map.take(@expected_fields)
  end
end
