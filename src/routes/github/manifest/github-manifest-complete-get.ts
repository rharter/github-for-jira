import { Request, Response } from "express";
import axios from "axios";
import { GitHubServerApp } from "~/src/models/github-server-app";
import { Installation } from "~/src/models/installation";

export const GithubManifestCompleteGet = async (req: Request, res: Response) => {
	const uuid = req.params.uuid;
	const jiraHost = res.locals.jiraHost;
	if (!jiraHost) {
		throw new Error("Jira Host not found");
	}
	const gheHost = req.session.temp?.gheHost;
	if (!gheHost) {
		throw new Error("GitHub Enterprise Host not found");
	}
	const installation = await Installation.getForHost(jiraHost);
	if (!installation) {
		throw new Error(`No Installation found for ${jiraHost}`);
	}
	// complete GitHub app manifest flow
	const apiUrl = `${gheHost}/api/v3/app-manifests/${req.query.code}/conversions`;
	const gitHubAppConfig = (await axios.post(apiUrl, {}, { headers: { Accept: "application/vnd.github.v3+json" } })).data;
	await GitHubServerApp.install({
		uuid,
		appId: gitHubAppConfig.id,
		gitHubAppName: gitHubAppConfig.name,
		gitHubBaseUrl: gheHost,
		gitHubClientId: gitHubAppConfig.client_id,
		gitHubClientSecret: gitHubAppConfig.client_secret,
		webhookSecret: gitHubAppConfig.webhook_secret,
		privateKey:  gitHubAppConfig.pem,
		installationId: installation.id
	});
	req.session.temp = undefined;
	res.json({ success:true });
};