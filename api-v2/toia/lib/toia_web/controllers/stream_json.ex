defmodule ToiaWeb.StreamJSON do
  alias Toia.Accounts.Stream

  @doc """
  Renders a list of stream.
  """
  def index(%{stream: stream}) do
    %{data: for(stream <- stream, do: data(stream))}
  end

  @doc """
  Renders a single stream.
  """
  def show(%{stream: stream}) do
    %{data: data(stream)}
  end

  defp data(%Stream{} = stream) do
    %{
      id: stream.id,
      name: stream.name,
      private: stream.private,
      likes: stream.likes,
      views: stream.views
    }
  end
end
