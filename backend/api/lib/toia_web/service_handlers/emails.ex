defmodule ServiceHandlers.Emails do
  import Swoosh.Email

  def confirmEmail(user) do
    {:ok, token, _claims} = Toia.Guardian.encode_and_sign(user, %{
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      language: user.language,
      email: user.email
    })
    url = "#{System.get_env("API_URL")}/api/auth/confirm_email?token=#{token}"

    new()
    |> to({user.first_name, user.email})
    |> from({"TOIA", System.get_env("GMAIL_SMTP_EMAIL")})
    |> subject("Confirm Your Email")
    |> html_body("""
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Confirm Your Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Email Confirmation</h2>
          <p>Dear #{user.first_name},</p>
          <p>Thank you for signing up! To complete your registration, please click the button below to confirm your email address:</p>
          <p>
            <a href="#{url}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 4px;">Confirm Email</a>
          </p>
          <p>If you did not sign up for this service, you can ignore this email.</p>
          <p>Thank you,<br>Team TOIA</p>
        </div>
      </body>
    </html>
    """)
  end
end
