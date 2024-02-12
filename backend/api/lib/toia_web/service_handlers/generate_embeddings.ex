defmodule ServiceHandlers.GenerateEmbeddings do
  use HTTPoison.Base

  @expected_fields ~w(object data model usage)

  def process_request_url(_url) do
    "https://api.openai.com/v1/embeddings"
  end

  def process_request_headers(_headers) do
    [
      {"Content-Type", "application/json"},
      {"OpenAI-Organization", System.get_env("YOUR_ORG_ID")},
      {"Authorization", "Bearer #{System.get_env("OPENAI_API_KEY")}"}
    ]
  end

  def process_request_body(%{question: question, answer: answer}) do
    query = "Question: #{question}; Answer: #{answer}"

    payload = %{
      model: "text-embedding-ada-002",
      input: query
    }

    Poison.encode!(payload)
  end

  def process_response_body(body) do
    (body
     |> Poison.decode!()
     |> Map.take(@expected_fields))["data"]
    |> Enum.at(0)
    |> Map.get("embedding")
  end
end
