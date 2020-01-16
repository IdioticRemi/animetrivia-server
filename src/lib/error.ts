export class ApiError {

	public status: number;
	public message: string;

	public constructor(message: string, status = 500) {
		this.message = message;
		this.status = status;
	}

}
