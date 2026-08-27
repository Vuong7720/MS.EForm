using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Volo.Abp.DependencyInjection;

namespace MS.EForm.FormServices
{
	public interface ICaptchaVerifier
	{
		Task<bool> VerifyAsync(string? token);
	}

	// xác thực chống spam qua Cloudflare Turnstile (https://challenges.cloudflare.com/turnstile/v0/siteverify).
	// SecretKey mặc định trong appsettings là test secret công khai do Cloudflare công bố - đổi sang secret
	// thật (dash.cloudflare.com) khi deploy production với domain thật.
	public class TurnstileCaptchaVerifier : ICaptchaVerifier, ITransientDependency
	{
		private readonly IHttpClientFactory _httpClientFactory;
		private readonly IConfiguration _configuration;

		public TurnstileCaptchaVerifier(IHttpClientFactory httpClientFactory, IConfiguration configuration)
		{
			_httpClientFactory = httpClientFactory;
			_configuration = configuration;
		}

		public async Task<bool> VerifyAsync(string? token)
		{
			var enabled = _configuration.GetValue<bool?>("Captcha:Enabled") ?? true;
			if (!enabled) return true;

			if (string.IsNullOrWhiteSpace(token)) return false;

			var secretKey = _configuration["Captcha:SecretKey"];
			var verifyUrl = _configuration["Captcha:VerifyUrl"];
			if (string.IsNullOrWhiteSpace(secretKey) || string.IsNullOrWhiteSpace(verifyUrl)) return false;

			try
			{
				var client = _httpClientFactory.CreateClient();
				var content = new FormUrlEncodedContent(new Dictionary<string, string>
				{
					["secret"] = secretKey,
					["response"] = token
				});

				var response = await client.PostAsync(verifyUrl, content);
				if (!response.IsSuccessStatusCode) return false;

				var json = await response.Content.ReadAsStringAsync();
				using var doc = JsonDocument.Parse(json);
				return doc.RootElement.TryGetProperty("success", out var successProp) && successProp.GetBoolean();
			}
			catch
			{
				// lỗi mạng/timeout khi gọi Cloudflare -> coi như xác thực thất bại, không chặn ngoại lệ ra ngoài
				return false;
			}
		}
	}
}
