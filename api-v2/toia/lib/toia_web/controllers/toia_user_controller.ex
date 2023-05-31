defmodule ToiaWeb.ToiaUserController do
  use ToiaWeb, :controller

  alias Toia.ToiaUsers
  alias Toia.ToiaUsers.ToiaUser

  action_fallback ToiaWeb.FallbackController

  def index(conn, _params) do
    toia_user = ToiaUsers.list_toia_user()
    render(conn, :index, toia_user: toia_user)
  end

  def create(conn, toia_user_params) do
    with {:ok, %ToiaUser{} = toia_user, _stream} <- ToiaUsers.create_toia_user_with_stream(toia_user_params) do
      with {:ok, token, _claims} <- Toia.Guardian.encode_and_sign(toia_user) do
        conn
        |> put_status(:created)
        |> put_resp_header("location", ~p"/api/toia_user/#{toia_user}")
        |> render(:show, toia_user: toia_user, token: token)
      else
        {:error, :secret_not_found} ->
          IO.warn "Guardian Secret not found in the environment"
          conn
          |> put_status(:internal_server_error)
          |> json(%{error: "Internal server error"})

        {:error, :reason} ->
          IO.inspect(:reason)
          conn
          |> put_status(:internal_server_error)
          |> json(%{error: "Internal server error"})
      end
    else
      {:error_pic, reason} ->
        IO.warn("Photo couldn't be uploaded")
        IO.warn(reason)
        conn
        |> put_status(:internal_server_error)
        |> json(%{error: "Photo couldn't be uploaded"})
      _ ->
        IO.inspect("Something went wrong")
        conn
        |> put_status(:internal_server_error)
        |> json(%{error: "Internal server error"})
    end
  end

  def show(conn, %{"id" => id}) do
    toia_user = ToiaUsers.get_toia_user!(id)
    render(conn, :show, toia_user: toia_user)
  end

  def update(conn, %{"id" => id, "toia_user" => toia_user_params}) do
    toia_user = ToiaUsers.get_toia_user!(id)

    with {:ok, %ToiaUser{} = toia_user} <- ToiaUsers.update_toia_user(toia_user, toia_user_params) do
      render(conn, :show, toia_user: toia_user)
    end
  end

  def delete(conn, %{"id" => id}) do
    toia_user = ToiaUsers.get_toia_user!(id)

    with {:ok, %ToiaUser{}} <- ToiaUsers.delete_toia_user(toia_user) do
      send_resp(conn, :no_content, "")
    end
  end
end
