defmodule Toia.PlayerFeedbacks do
  @moduledoc """
  The PlayerFeedbacks context.
  """

  import Ecto.Query, warn: false
  alias Toia.Repo

  alias Toia.PlayerFeedbacks.PlayerFeedback

  @doc """
  Returns the list of player_feedback.

  ## Examples

      iex> list_player_feedback()
      [%PlayerFeedback{}, ...]

  """
  def list_player_feedback do
    Repo.all(PlayerFeedback)
  end

  @doc """
  Gets a single player_feedback.

  Raises `Ecto.NoResultsError` if the Player feedback does not exist.

  ## Examples

      iex> get_player_feedback!(123)
      %PlayerFeedback{}

      iex> get_player_feedback!(456)
      ** (Ecto.NoResultsError)

  """
  def get_player_feedback!(id), do: Repo.get!(PlayerFeedback, id)

  @doc """
  Creates a player_feedback.

  ## Examples

      iex> create_player_feedback(%{field: value})
      {:ok, %PlayerFeedback{}}

      iex> create_player_feedback(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_player_feedback(attrs \\ %{}) do
    %PlayerFeedback{}
    |> PlayerFeedback.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a player_feedback.

  ## Examples

      iex> update_player_feedback(player_feedback, %{field: new_value})
      {:ok, %PlayerFeedback{}}

      iex> update_player_feedback(player_feedback, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_player_feedback(%PlayerFeedback{} = player_feedback, attrs) do
    player_feedback
    |> PlayerFeedback.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a player_feedback.

  ## Examples

      iex> delete_player_feedback(player_feedback)
      {:ok, %PlayerFeedback{}}

      iex> delete_player_feedback(player_feedback)
      {:error, %Ecto.Changeset{}}

  """
  def delete_player_feedback(%PlayerFeedback{} = player_feedback) do
    Repo.delete(player_feedback)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking player_feedback changes.

  ## Examples

      iex> change_player_feedback(player_feedback)
      %Ecto.Changeset{data: %PlayerFeedback{}}

  """
  def change_player_feedback(%PlayerFeedback{} = player_feedback, attrs \\ %{}) do
    PlayerFeedback.changeset(player_feedback, attrs)
  end
end
