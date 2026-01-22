def get_otp_email_html(otp_code: str, user_name: str = None) -> str:
    """Generate beautiful HTML email template for OTP verification"""
    
    greeting = f"Welcome, {user_name} 👋" if user_name else "Welcome to SkillMate 👋"
    
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - SkillMate</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Mulish', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f3ff;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f3ff; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(124, 58, 237, 0.1); overflow: hidden;">
                        <!-- Header with Branding -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); padding: 40px 30px; text-align: center;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 800; letter-spacing: -0.02em;">SkillMate</h1>
                            </td>
                        </tr>
                        
                        <!-- Email Verification Badge -->
                        <tr>
                            <td style="padding: 20px 30px 0; text-align: center;">
                                <span style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: #ffffff; padding: 8px 20px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">EMAIL VERIFICATION</span>
                            </td>
                        </tr>
                        
                        <!-- Main Content -->
                        <tr>
                            <td style="padding: 30px 40px;">
                                <!-- Greeting -->
                                <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 28px; font-weight: 800; letter-spacing: -0.02em; text-align: center;">
                                    {greeting}
                                </h2>
                                
                                <!-- Introduction -->
                                <p style="margin: 0 0 32px 0; color: #6b7280; font-size: 16px; line-height: 1.6; text-align: center; letter-spacing: -0.005em;">
                                    We're excited to help you discover your perfect engineering domain! 🚀<br>
                                    Use the one-time code below to verify your email and unlock your personalized dashboard. ✨
                                </p>
                                
                                <!-- OTP Code Box -->
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 32px 0;">
                                    <tr>
                                        <td style="background-color: #f9fafb; border: 2px solid #e5e7eb; border-radius: 12px; padding: 30px; text-align: center;">
                                            <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;">YOUR ONE-TIME VERIFICATION CODE</p>
                                            <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: #ffffff; font-size: 48px; font-weight: 800; letter-spacing: 0.2em; padding: 20px; border-radius: 8px; margin: 16px 0; display: inline-block; min-width: 280px;">
                                                {otp_code}
                                            </div>
                                            <p style="margin: 16px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                                This code will expire in <strong style="color: #7c3aed; font-weight: 700;">10 minutes</strong>. ⏰<br>
                                                Please do not share it with anyone. 🔒
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                                
                                <!-- Instructions -->
                                <div style="background-color: #f5f3ff; border-left: 4px solid #7c3aed; border-radius: 8px; padding: 20px; margin: 32px 0;">
                                    <p style="margin: 0 0 12px 0; color: #1f2937; font-size: 16px; font-weight: 600;">What to do next: 📋</p>
                                    <ol style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 15px; line-height: 1.8;">
                                        <li style="margin-bottom: 8px;">Go back to the SkillMate tab in your browser 🌐</li>
                                        <li style="margin-bottom: 8px;">Enter this 6-digit code on the "Verify your email" screen ✍️</li>
                                        <li>You'll be welcomed into your dashboard once verification is complete! 🎉</li>
                                    </ol>
                                </div>
                                
                                <!-- Help Section -->
                                <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                                    <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                                        Need help? 🤔 Check your spam/promotions folder or contact our support team.
                                    </p>
                                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                        If you didn't request this code, you can safely ignore this email.
                                    </p>
                                </div>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; font-weight: 600;">SkillMate</p>
                                <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                    Your friendly guide to engineering domains 💜
                                </p>
                                <p style="margin: 16px 0 0 0; color: #9ca3af; font-size: 11px;">
                                    © 2024 SkillMate. All rights reserved.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    return html_content

def get_welcome_email_html(user_name: str = None, user_email: str = None) -> str:
    """Generate beautiful HTML email template for welcome after successful verification"""
    
    greeting = f"Welcome, {user_name}! 🎉" if user_name else "Welcome to SkillMate! 🎉"
    
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to SkillMate</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Mulish', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f3ff;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f3ff; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(124, 58, 237, 0.1); overflow: hidden;">
                        <!-- Header with Branding -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); padding: 40px 30px; text-align: center;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 800; letter-spacing: -0.02em;">SkillMate</h1>
                            </td>
                        </tr>
                        
                        <!-- Success Badge -->
                        <tr>
                            <td style="padding: 20px 30px 0; text-align: center;">
                                <span style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; padding: 8px 20px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">ACCOUNT VERIFIED ✅</span>
                            </td>
                        </tr>
                        
                        <!-- Main Content -->
                        <tr>
                            <td style="padding: 30px 40px;">
                                <!-- Greeting -->
                                <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 28px; font-weight: 800; letter-spacing: -0.02em; text-align: center;">
                                    {greeting}
                                </h2>
                                
                                <!-- Success Message -->
                                <p style="margin: 0 0 32px 0; color: #6b7280; font-size: 16px; line-height: 1.6; text-align: center; letter-spacing: -0.005em;">
                                    Your email has been successfully verified! 🎊<br>
                                    You're all set to start your engineering domain discovery journey. Let's explore what SkillMate has to offer! ✨
                                </p>
                                
                                <!-- Services Section -->
                                <div style="margin: 32px 0;">
                                    <h3 style="margin: 0 0 24px 0; color: #1f2937; font-size: 22px; font-weight: 700; text-align: center; letter-spacing: -0.01em;">
                                        What SkillMate Offers You 🚀
                                    </h3>
                                    
                                    <!-- Service 1 -->
                                    <div style="background-color: #f9fafb; border-left: 4px solid #7c3aed; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
                                        <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                                            🎯 AI-Powered Domain Discovery
                                        </h4>
                                        <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                                            Answer simple questions about your interests and thinking style. Our AI analyzes your responses to recommend the perfect CS domain for you - no technical knowledge required!
                                        </p>
                                    </div>
                                    
                                    <!-- Service 2 -->
                                    <div style="background-color: #f9fafb; border-left: 4px solid #7c3aed; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
                                        <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                                            💻 Explore 5 CS Domains
                                        </h4>
                                        <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                                            Discover Software Development, AI & Machine Learning, Data Science, Cybersecurity, and Cloud & DevOps. Each domain is explained in beginner-friendly language.
                                        </p>
                                    </div>
                                    
                                    <!-- Service 3 -->
                                    <div style="background-color: #f9fafb; border-left: 4px solid #7c3aed; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
                                        <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                                            📊 Personalized Recommendations
                                        </h4>
                                        <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                                            Get tailored domain suggestions based on your unique interests, thinking style, and career goals. No one-size-fits-all approach - it's all about you!
                                        </p>
                                    </div>
                                    
                                    <!-- Service 4 -->
                                    <div style="background-color: #f9fafb; border-left: 4px solid #7c3aed; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
                                        <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                                            🎓 Beginner-Friendly Approach
                                        </h4>
                                        <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                                            Perfect for first-year engineering students! No pressure, no technical jargon. We explain everything in simple terms so you can make informed decisions about your future.
                                        </p>
                                    </div>
                                    
                                    <!-- Service 5 -->
                                    <div style="background-color: #f9fafb; border-left: 4px solid #7c3aed; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
                                        <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                                            🤝 Supportive Community
                                        </h4>
                                        <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                                            Connect with other first-year students who are on the same journey. Share experiences, ask questions, and grow together in a supportive environment.
                                        </p>
                                    </div>
                                    
                                    <!-- Service 6 -->
                                    <div style="background-color: #f9fafb; border-left: 4px solid #7c3aed; border-radius: 8px; padding: 20px;">
                                        <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                                            💜 No Pressure, Just Guidance
                                        </h4>
                                        <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                                            Take your time. Explore at your own pace. There's no rush, no competition, and no judgment. We're here to guide you, not push you.
                                        </p>
                                    </div>
                                </div>
                                
                                <!-- CTA Section -->
                                <div style="background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%); border-radius: 12px; padding: 30px; text-align: center; margin: 32px 0;">
                                    <h3 style="margin: 0 0 12px 0; color: #1f2937; font-size: 20px; font-weight: 700;">
                                        Ready to Start? 🚀
                                    </h3>
                                    <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                                        Log in to your SkillMate dashboard and begin your domain discovery journey today!
                                    </p>
                                    <a href="http://localhost:3000/login" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; letter-spacing: -0.01em;">
                                        Go to Dashboard →
                                    </a>
                                </div>
                                
                                <!-- Account Info -->
                                <div style="background-color: #f5f3ff; border-radius: 8px; padding: 20px; margin: 32px 0; text-align: center;">
                                    <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; font-weight: 600;">Your Account Details</p>
                                    <p style="margin: 0; color: #4b5563; font-size: 14px;">
                                        Email: <strong style="color: #1f2937;">{user_email if user_email else 'Your registered email'}</strong>
                                    </p>
                                    <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 12px;">
                                        You can now log in using this email address and your password.
                                    </p>
                                </div>
                                
                                <!-- Help Section -->
                                <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                                    <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                                        Questions? We're here to help! 🤔<br>
                                        Reach out to our support team anytime.
                                    </p>
                                </div>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; font-weight: 600;">SkillMate</p>
                                <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                    Your friendly guide to engineering domains 💜
                                </p>
                                <p style="margin: 16px 0 0 0; color: #9ca3af; font-size: 11px;">
                                    © 2024 SkillMate. All rights reserved.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    return html_content

def get_resend_otp_email_html(otp_code: str, user_name: str = None) -> str:
    """Generate HTML email template for resent OTP"""
    
    greeting = f"Hi {user_name} 👋" if user_name else "Hi there 👋"
    
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Verification Code - SkillMate</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Mulish', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f3ff;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f3ff; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 20px rgba(124, 58, 237, 0.1); overflow: hidden;">
                        <!-- Header with Branding -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); padding: 40px 30px; text-align: center;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 800; letter-spacing: -0.02em;">SkillMate</h1>
                            </td>
                        </tr>
                        
                        <!-- Email Verification Badge -->
                        <tr>
                            <td style="padding: 20px 30px 0; text-align: center;">
                                <span style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: #ffffff; padding: 8px 20px; border-radius: 20px; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;">NEW VERIFICATION CODE</span>
                            </td>
                        </tr>
                        
                        <!-- Main Content -->
                        <tr>
                            <td style="padding: 30px 40px;">
                                <!-- Greeting -->
                                <h2 style="margin: 0 0 16px 0; color: #1f2937; font-size: 28px; font-weight: 800; letter-spacing: -0.02em; text-align: center;">
                                    {greeting}
                                </h2>
                                
                                <!-- Introduction -->
                                <p style="margin: 0 0 32px 0; color: #6b7280; font-size: 16px; line-height: 1.6; text-align: center; letter-spacing: -0.005em;">
                                    You requested a new verification code! 🔄<br>
                                    Here's your fresh one-time code to complete your email verification. ✨
                                </p>
                                
                                <!-- OTP Code Box -->
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 32px 0;">
                                    <tr>
                                        <td style="background-color: #f9fafb; border: 2px solid #e5e7eb; border-radius: 12px; padding: 30px; text-align: center;">
                                            <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;">YOUR NEW VERIFICATION CODE</p>
                                            <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); color: #ffffff; font-size: 48px; font-weight: 800; letter-spacing: 0.2em; padding: 20px; border-radius: 8px; margin: 16px 0; display: inline-block; min-width: 280px;">
                                                {otp_code}
                                            </div>
                                            <p style="margin: 16px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                                This code will expire in <strong style="color: #7c3aed; font-weight: 700;">10 minutes</strong>. ⏰<br>
                                                Please do not share it with anyone. 🔒
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                                
                                <!-- Instructions -->
                                <div style="background-color: #f5f3ff; border-left: 4px solid #7c3aed; border-radius: 8px; padding: 20px; margin: 32px 0;">
                                    <p style="margin: 0 0 12px 0; color: #1f2937; font-size: 16px; font-weight: 600;">Quick steps: 📋</p>
                                    <ol style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 15px; line-height: 1.8;">
                                        <li style="margin-bottom: 8px;">Return to SkillMate in your browser 🌐</li>
                                        <li style="margin-bottom: 8px;">Enter the code above on the verification screen ✍️</li>
                                        <li>Start your domain discovery journey! 🚀</li>
                                    </ol>
                                </div>
                                
                                <!-- Help Section -->
                                <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                                    <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                                        Need help? 🤔 Check your spam/promotions folder or contact our support team.
                                    </p>
                                    <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                        If you didn't request this code, you can safely ignore this email.
                                    </p>
                                </div>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px; font-weight: 600;">SkillMate</p>
                                <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                                    Your friendly guide to engineering domains 💜
                                </p>
                                <p style="margin: 16px 0 0 0; color: #9ca3af; font-size: 11px;">
                                    © 2024 SkillMate. All rights reserved.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    return html_content
