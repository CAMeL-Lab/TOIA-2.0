defmodule ToiaWeb.StreamJSON do
  alias Toia.Streams.Stream

  @doc """
  Renders a list of stream.
  """
  def index(%{stream: stream}) do
    for(stream <- stream, do: data(stream))
  end

  @doc """
  Renders a single stream.
  """
  def show(%{stream: stream}) do
    data(stream)
  end

  defp data(%{:videos_count => _, :pic => _} = stream) do
    %{
      id_stream: stream.id_stream,
      name: stream.name,
      private: stream.private,
      likes: stream.likes,
      views: stream.views,
      toia_id: stream.toia_id,
      videos_count: stream.videos_count,
      pic: stream.pic
    }
  end

  defp data(%Stream{} = stream) do
    %{
      id_stream: stream.id_stream,
      name: stream.name,
      private: stream.private,
      likes: stream.likes,
      views: stream.views,
      toia_id: stream.toia_id
    }
  end
end
