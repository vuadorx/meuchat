import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Lidar com erros de OAuth
    if (error) {
          console.error('Erro OAuth:', error, errorDescription);
          return NextResponse.redirect(
                  new URL(`/?error=${error}&description=${errorDescription}`, request.url)
                );
        }

    // Trocar código por token
    if (!code) {
          return NextResponse.redirect(new URL('/?error=no_code', request.url));
        }

    try {
const appId = process.env.INSTAGRAM_APP_ID as string;          const appSecret = process.env.INSTAGRAM_APP_SEChRET as string;
          const redirectUri = new URL(request.url).origin + '/api/oauth/callback';

          const tokenResponse = await fetch('https://graph.instagram.com/v18.0/oauth/access_token', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                  body: new URLSearchParams({
                            client_id: appId,
                            client_secret: appSecret,
                            grant_type: 'authorization_code',
                            code,
                            redirect_uri: redirectUri,
                          }).toString(),
                });

          const data = await tokenResponse.json();

          if (data.error) {
                  console.error('Erro na Troca de Token:', data.error);
                  return NextResponse.redirect(
                            new URL(`/?error=${data.error.type}`, request.url)
                          );
                }

          // Sucesso - Salve o token no seu banco de dados
          console.log('Sucesso OAuth:', data);

          // Por enquanto, redirecione para a home com sucesso
          return NextResponse.redirect(new URL('/?success=true&user_id=' + data.user_id, request.url));
        } catch (error) {
          console.error('Erro no Callback OAuth:', error);
          return NextResponse.redirect(new URL('/?error=server_error', request.url));
        }
  }
