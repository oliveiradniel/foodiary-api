import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { s3Client } from '@infra/clients/s3Client';

import { Injectable } from '@kernel/decorators/Injectable';

import { Meal } from '@application/entities/Meal';
// oxlint-disable-next-line typescript/consistent-type-imports
import { AppConfig } from '@shared/config/AppConfig';

import { HeadObjectCommand } from '@aws-sdk/client-s3';
import { minutesToSeconds } from '@shared/utils/minutesToSeconds';
import { randomUUIDv7 } from 'node:crypto';

@Injectable()
export class MealsFileStorageGateway {
	constructor(private readonly appConfig: AppConfig) {}

	static generateInputFileKey({
		accountId,
		inputType,
	}: MealsFileStorageGateway.GenerateInputFileKeyParams) {
		const extension = inputType === Meal.InputType.AUDIO ? 'm4a' : 'jpeg';
		const filename = `${randomUUIDv7()}.${extension}`;

		return `${accountId}/${filename}`;
	}

	getFileURL(fileKey: string) {
		return `https://${this.appConfig.cdn.mealsCDN}/${fileKey}`;
	}

	async createPOST({
		mealId,
		file,
		accountId,
	}: MealsFileStorageGateway.CreatePOSTParams): Promise<MealsFileStorageGateway.CreatePOSTResult> {
		const bucket = this.appConfig.storage.mealsBucket;
		const contentType =
			file.inputType === Meal.InputType.AUDIO ? 'audio/m4a' : 'image/jpeg';

		const { url, fields } = await createPresignedPost(s3Client, {
			Bucket: bucket,
			Key: file.key,
			Expires: minutesToSeconds(5),
			Conditions: [
				{ bucket },
				['eq', '$key', file.key],
				['eq', '$Content-Type', contentType],
				['content-length-range', file.size, file.size],
			],
			Fields: {
				'x-amz-meta-mealid': mealId,
				'x-amz-meta-accountid': accountId,
			},
		});

		const uploadSignature = Buffer.from(
			JSON.stringify({
				url,
				fields: {
					...fields,
					'Content-Type': contentType,
				},
			}),
		).toString('base64');

		return { uploadSignature };
	}

	async getFileMetadata({
		fileKey,
	}: MealsFileStorageGateway.GetFileMetadataParams): Promise<MealsFileStorageGateway.GetFileMetadataResult> {
		const command = new HeadObjectCommand({
			Bucket: this.appConfig.storage.mealsBucket,
			Key: fileKey,
		});

		const { Metadata = {} } = await s3Client.send(command);

		if (!Metadata.accountid || !Metadata.mealid) {
			throw new Error(`[getFileMetadata] Cannot process file "${fileKey}"`);
		}

		return {
			accountId: Metadata.accountid,
			mealId: Metadata.mealid,
		};
	}
}

export namespace MealsFileStorageGateway {
	export type GenerateInputFileKeyParams = {
		accountId: string;
		inputType: Meal.InputType;
	};

	export type CreatePOSTParams = {
		mealId: string;
		accountId: string;
		file: {
			key: string;
			size: number;
			inputType: Meal.InputType;
		};
	};

	export type CreatePOSTResult = {
		uploadSignature: string;
	};

	export type GetFileMetadataParams = {
		fileKey: string;
	};

	export type GetFileMetadataResult = {
		accountId: string;
		mealId: string;
	};
}
