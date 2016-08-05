<?php
include_once $_SERVER['DOCUMENT_ROOT'] . '/../core/config.php';
$app = App::getInstance();
include_once $_SERVER['DOCUMENT_ROOT'] . '/../core/data/' . App::$localeCode . '.php';

if (isset($_GET['uri']) && preg_match('/controller\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)/', $_GET['uri'], $matches)) {
	include $_SERVER['DOCUMENT_ROOT'] . '/../core/controllers/www/' . $matches[1] . '/' . $matches[2] . '.php';
	die;
}
?><!DOCTYPE HTML>
<html xmlns:fb="http://ogp.me/ns/fb#">
	<head>
		<title>Choose gifts and party supplies on Feel Geekish</title>
		<meta http-equiv='Content-Type' content='text/html; charset=utf-8' />
		<?php if (!isset($_GET['itemID'])) { ?>
		<meta name='description' content='A completely new way of choosing gifts and party supplies. Feel Geekish allows finding great gifts by knowing only a few basic facts about a person.' />
		<?php } else {
			$item = new Item($_GET['itemID']);
		?>
		<meta property="og:image" content="/data/<?php echo $item->images[0]; ?>-details.jpg" />
		<meta property="og:title" content="<?php echo $item->name; ?> - Feel Geekish" /> 
		<meta property="og:description" content="<?php echo substr(strip_tags($item->description), 0, 300), '...'; ?>" />
		<?php } ?>
        <link rel='shortcut icon' href='/favicon.ico' />

		<!--<link rel='stylesheet/less' type='text/css' href='/css/style.less' />-->
		<!--<script type='text/javascript' src='/js/less.js'></script>-->
		
		<link rel='stylesheet' type='text/css' href='/css/style.<?php echo RELEASE_NUMBER; ?>.css' />
		<link rel='stylesheet' type='text/css' href='/css/awesome/font-awesome.min.css' />

        <script type='text/javascript' src='/js/jquery.<?php echo RELEASE_NUMBER; ?>.js'></script>
		<script type='text/javascript' src='/js/app.<?php echo RELEASE_NUMBER; ?>.js'></script>
		<script type='text/javascript' src='/js/data/en.<?php echo RELEASE_NUMBER; ?>.js'></script>
		<?php if (App::$department == DEPT_MUSIC) { ?>
		<link type="text/css" href="/skin/jplayer.blue.monday.css" rel="stylesheet" />
		<script type="text/javascript" src="/js/jquery.jplayer.min.js"></script>
		<?php } ?>
		
		<script>
			$(document).ready(function() {
				app.params.deptID = <?php echo App::$department; ?>;
				if (app.mobilecheck()) {
					//window.location.href = '//m.' + document.domain;
				}
				app.init();
				<?php
				if (isset($_GET['itemID'])) { ?>
				app.catalog.item.loadAndShowInfo(<?php echo $_GET['itemID']; ?>);
				<?php } ?>
			});
		</script>
	</head>
	<body class='s <?php echo strtolower(Data::$departments[App::$department]); ?>'>
		<div class='wrapper'>
			<div class='header-container'>
				<!-- HEADER -->
				<div class='header'>
					<div class='logo'></div>
					<div class='tools'>
						<ul>
							<li class='menu'>
								<a href='javascript:void(0)' data-tooltip='menu'>
									<i class='icon-reorder'></i>
									<span class='t'>Menu</span>
									<span class='d'>Choose your store and more</span>
								</a>
							</li>
							<li class='switch resemblance'>
								<a data-search='resemblance' href='javascript:void(0)' data-tooltip='resemblance search'>
									<i class='icon-adjust'></i>
									<span class='t'>Resemblance</span>
									<span class='d'>What is it like and unlike?</span>
								</a>
							</li>
							<li class='switch fuzzy'>
								<a data-search='fuzzy' href='javascript:void(0)' data-tooltip='fuzzy search'>
									<i class='icon-magic'></i>
									<span class='t'>Fuzzy</span>
									<span class='d'>Is it more this or that?</span>
								</a>
							</li>
							<li class='switch tagged'>
								<a data-search='tagged' href='javascript:void(0)' data-tooltip='tagged search'>
									<i class='icon-tag'></i>
									<span class='t'>Tagged</span>
									<span class='d'>Search by tags and features</span>
								</a>
							</li>
						</ul>
					</div>
				</div>
			</div>
			
			<div class='controls-container'>
				<div class='controls tagged' style='display: none'>
					<div class='caption'>Tagged search</div>
					<div class='description'>Open filters below and choose features that the item should have.</div>
					<ul class='filters'>
						<?php
						foreach (Data::$filters[App::$department] as $id => $data) {
							echo <<<HERE
								<li class='filter{$id}'>
									<a href='javascript:void(0)' data-filter='{$id}'>
										<span class='c'>{$data['name']}</span>
										<i class='icon-caret-down'></i>
										<i class='icon-caret-up'></i>
										<span class='d'>{$data['caption']}</span>
									</a>
								</li>
HERE;
						}
						?>
					</ul>
					<div class='filters-container'>
						<?php
						foreach (Data::$filters[App::$department] as $filterID => $data) {
							echo <<<HERE
								<div class='filter tagged filter{$filterID}'>
								<div class='content'>
HERE;
							foreach (Data::$options as $optionID => $optionName) {
								if ($optionID >= $filterID && $optionID < $filterID + 100) {
									echo "<a class='option option{$optionID}' data-id='{$optionID}' href='javascript:void(0)'>{$optionName}</a>";
								}
							}
							echo "</div></div>";
						}
						?>
						
					</div>
					<div class='selected' style='display: none'>
						<div class='caption'>Applied filters</div>
						<div class='content'>
						</div>
						<div class='clearfix'></div>
					</div>
					<div class='clearfix'></div>
				</div>
				<div class='controls sintaxis' style='display: none'>
					<a class='closer' href='javascript:void(0)'><i class='icon-chevron-sign-up'></i></a>
					<div class='caption'>Search</div>
					<div class='content'>
						<div class='label'>Your query</div>
						<input type='text' id='searchBox' />
						<div class='clearfix'></div>
					</div>
				</div>
				<div class='controls fuzzy' style='display: none'>
					<div class='caption'>Fuzzy search</div>
					<div class='description'>Move handlers (light grey squares) to the left or to the right with your mouse.</div>
					<?php
					$i = 0;
					foreach (Data::$parameters[App::$department] as $parameterName => $parameterData) {
						$labelLeft  = $parameterData['left'];
						$labelRight = $parameterData['right'];
						$startPosition = 50;//floor(($parameterData['max'] - $parameterData['min']) / 2);
						$startText = $parameterData['contents'][floor((count($parameterData['contents']) - 1) / 2)];
						$tooltipTexts = implode(',', $parameterData['contents']);
						echo <<<HERE
							<div class='trackbar rs{$i}' data-name='rs{$i}'>
							<div class='label-left'>{$labelLeft}</div>
							<div class='label-right'>{$labelRight}</div>
							<div class='track-container'>
								<div class='track'>
									<a class='handler' data-position='{$startPosition}' data-texts="{$tooltipTexts}">
										<span class='inner'>
											<span class='tooltip'>{$startText}</span>
											<span class='to'></span>
											<span class='ti'></span>
										</span>
									</a>
								</div>
							</div>
							<div class='clearfix'></div>
						</div>
HERE;
						$i++;
					}
					?>
				</div>
				<div class='controls resemblance' style='display: none'>
					<div class='caption'>Resemblance search</div>
					<div class='description'>Now every card has two additional buttons: 'thumbs up' and 'thumbs down'. After every click on these buttons a list of cards will be updated so that you could explore cards further towards your ideal gift.</div>
					<div class='description'>If you would like to start your search from the beginning, just click on this link: <a class='reset' href='javascript:void(0)'>reset</a>.</div>
				</div>
			</div>
			
			<!-- CONTENT -->
			
			<div class='content-container'>
				<div class='content'></div>
			</div>
			<div class='footer-placeholder'></div>
		</div>
		<div class='footer-container'>
			<div class='footer'>
				<span class='left'>&copy; <?php echo date('Y'); ?> Feel Geekish</span>
				<a href='javascript:void(0)' onclick='app.pages.load("about")'>about</a>
				<a href='javascript:void(0)' onclick='app.pages.load("policy")'>privacy policy</a>
				<a href='//partners.feelgeekish.com/'>for partners</a>
				<div class='bc'></div>
				<div class='clearfix'></div>
			</div>
		</div>
		
		<div class='to-top' style='display: none'>
			<a class='tt-top'><i class='icon-arrow-up'></i> Back to top</a>
			<a class='tt-menu'><i class='icon-reorder'></i> Menu</a>
		</div>
		
		<div class='depts'>
			<div class='c'>Choose your store</div>
			<ul class='stores'>
				<li>
					<a class='g' href='//<?php echo App::$domainName; ?>.com/'>General store</a>
				</li>
				<li>
					<a class='m' href='//music.<?php echo App::$domainName; ?>.com/'>Music store</a>
				</li>
			</ul>
			<div class='c'>Learn more</div>
			<ul>
				<li>
					<a href='javascript:void(0)' class='taketour'>Take a tour</a>
				</li>
				<li>
					<a href='javascript:void(0)' onclick='app.pages.load("about")'>About Feel Geekish</a>
				</li>
			</ul>
			<div class='ftr'>
				<span class='title'>&copy; <?php echo date('Y'); ?> Feel Geekish</span>
				<a href='javascript:void(0)' onclick='app.pages.load("about")'>about</a> | 
				<a href='javascript:void(0)' onclick='app.pages.load("policy")'>privacy policy</a> | 
				<!--<a href='//partners.feelgeekish.com/'>for partners</a>-->
			</div>
		</div>
	
		
		<div class='backdrop' style='display: none'>
			<div class='bd'>
				<?php include $_SERVER['DOCUMENT_ROOT']. '/../core/controllers/www/pages/modal-' . strtolower(Data::$departments[App::$department]) . '.php'; ?>
			</div>
		</div>
		<?php
		if (App::$department == DEPT_MUSIC) {
			include $_SERVER['DOCUMENT_ROOT'] . '/../core/controllers/www/pages/music-player.php';
		}
		?>
		
		<script type="text/javascript">
			var _gaq = _gaq || [];
			_gaq.push(['_setAccount', 'UA-41870220-2']);
			_gaq.push(['_trackPageview']);
			(function() {
			var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true; 
			
			ga.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'stats.g.doubleclick.net/dc.js';
			
			var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
			})();
		</script>
		
	</body>
</html>