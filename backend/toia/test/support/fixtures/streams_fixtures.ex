defmodule Toia.StreamsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Toia.Streams` context.
  """

  @doc """
  Generate a stream.
  """
  def stream_fixture(attrs \\ %{}) do
    {:ok, stream} =
      attrs
      |> Enum.into(%{
        likes: 42,
        name: "some name",
        private: true,
        views: 42
      })
      |> Toia.Streams.create_stream()

    stream
  end
end
