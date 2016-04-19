<h1><i class="fa fa-envelope-o"></i>Tool Suit</h1>

<div class="row">
	<div class="col-lg-12">
		<blockquote>
			Tool Suit
		</blockquote>
	</div>
</div>

<hr />

<form role="form" class="k68-tool-suit-settings">
	<fieldset>
		<div class="row">
			<div class="col-sm-12">
				<div class="form-group">
					<label for="emailer:local:host">HOST</label>
					<input type="text" class="form-control" id="emailer:local:host" name="emailer:local:host" />
				</div>
			</div>
			<div class="col-sm-12">
				<div class="form-group">
					<label for="emailer:local:port">PORT</label>
					<input type="text" class="form-control" value="25" id="emailer:local:port" name="emailer:local:port" />
				</div>
			</div>
			<div class="col-sm-12">
				<div class="form-group">
					<label for="emailer:local:username">USERNAME</label>
					<input type="text" class="form-control" id="emailer:local:username" name="emailer:local:username" />
				</div>
			</div>
			<div class="col-sm-12">
				<div class="form-group">
					<label for="emailer:local:password">PASSWORD</label>
					<input type="password" class="form-control" id="emailer:local:password" name="emailer:local:password" />
				</div>
			</div>
			<div class="col-sm-12">
				<div class="form-group">
					<label>
						<input type="checkbox" id="emailer:local:secure" name="emailer:local:secure"/>
						 SECURE
					</label>
				</div>
			</div>
			<div class="col-sm-12">
				<div class="form-group">
					<label for="toolSuit:listPub">DB Pub Channel</label>
					<input type="text" class="form-control" id="toolSuit:listPub" name="toolSuit:listPub" />
				</div>
			</div>
			<div class="col-sm-12">
				<div class="form-group">
					<label for="toolSuit:listSub">DB Sub Channel</label>
					<input type="text" class="form-control" id="toolSuit:listSub" name="toolSuit:listSub" />
				</div>
			</div>
			<div class="col-sm-12">
				<div class="form-group">
					<label>
						<input type="checkbox" id="toolSuit:openPubSub" name="toolSuit:openPubSub"/>
						 Open Pub/Sub
					</label>
				</div>
			</div>
		</div>

		<button class="btn btn-lg btn-primary" id="save">SAVE</button>
	</fieldset>
</form>

<script type="text/javascript">
	require(['settings'], function(Settings) {
		Settings.load('k68_tool_suit', $('.k68-tool-suit-settings'));

		$('#save').on('click', function() {
			Settings.save('k68_tool_suit', $('.k68-tool-suit-settings'), function() {
				app.alert({
					alert_id: 'k68_tool_suit',
					type: 'info',
					title: 'Setting Changed',
					message: 'please reload',
					timeout: 5000
				});
			});
		});
	});
</script>
