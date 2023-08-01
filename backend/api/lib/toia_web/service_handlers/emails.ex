defmodule ServiceHandlers.Emails do
  import Swoosh.Email

  def confirmEmail(user) do
    {:ok, token, _claims} =
      Toia.Guardian.encode_and_sign(user, %{
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        language: user.language,
        email: user.email
      })

    verifyLink = "#{System.get_env("API_URL")}/api/auth/confirm_email?token=#{token}"

    System.cmd(
      "node",
      ["lib/toia_web/services/email.js", user.first_name, user.email, verifyLink],
      env: [
        {"GMAIL_SMTP_EMAIL", System.get_env("GMAIL_SMTP_EMAIL")},
        {"GMAIL_SMTP_APP_PASSWORD", System.get_env("GMAIL_SMTP_APP_PASSWORD")}
      ],
      into: IO.stream()
    )
  end
end
