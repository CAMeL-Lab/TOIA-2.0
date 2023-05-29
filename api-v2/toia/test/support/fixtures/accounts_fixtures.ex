defmodule Toia.AccountsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Toia.Accounts` context.
  """

  @doc """
  Generate a toia__user.
  """
  def toia__user_fixture(attrs \\ %{}) do
    {:ok, toia__user} =
      attrs
      |> Enum.into(%{
        email: "some email",
        first_name: "some first_name",
        language: "some language",
        last_name: "some last_name",
        password: "some password"
      })
      |> Toia.Accounts.create_toia__user()

    toia__user
  end

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
      |> Toia.Accounts.create_stream()

    stream
  end

  @doc """
  Generate a stream_view_permission.
  """
  def stream_view_permission_fixture(attrs \\ %{}) do
    {:ok, stream_view_permission} =
      attrs
      |> Enum.into(%{

      })
      |> Toia.Accounts.create_stream_view_permission()

    stream_view_permission
  end
end
